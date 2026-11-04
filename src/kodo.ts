import { Constructor, NodeNamespace } from "./_define";
import { DataNode, DataNodeMap, LinkNode, QueryNode } from "./nodes";
import { INotifier, NotificationEngine, NotificationRule, Notifier, RuleViolation } from "./notify";
import { IDataProvider } from "./providers";
import { INodeTranslator } from "./translators";
import { generateHashCode } from "./utils";

export interface ExploreOption {
    tierLimit: number;
}

export interface KodoOption extends ExploreOption {
    //TODO here: no useful
    cache: boolean;
    recursion: boolean;
    //每次查询强制 limit，防止客户编写错误查询导致大量数据返回
    limit: number;
}

//It's bulky, but it's powerful
export class Kodo {
    private translators: INodeTranslator[];
    private providers: Map<string, IDataProvider>;
    private nodes: DataNodeMap;
    private classMap: Record<string, Constructor<any>>;
    private notifier: Notifier;
    private inited: boolean;

    opt: KodoOption;

    constructor(protected name: string, opt?: Partial<KodoOption>) {
        this.translators = [];
        this.providers = new Map();
        this.nodes = new DataNodeMap();
        this.opt = this.getDefaultOption(opt);
        this.classMap = {};
        this.notifier = new Notifier();
        this.inited = false;
    }

    private getDefaultOption(opt?: Partial<KodoOption>): KodoOption {
        let defaultOpt: KodoOption = {
            cache: false,
            recursion: true,
            tierLimit: 0,
            limit: 10
        };

        let theOpt = Object.assign(defaultOpt, opt || {});
        return theOpt;
    }

    //try get IKodoID
    tryGetObjectId(obj: any, $ns: string): string | null {
        let cls = this.classMap[$ns];
        if (!cls) { return null; }

        const descriptor = Object.getOwnPropertyDescriptor(cls.prototype, '$id');

        if (descriptor?.get) {
            const value = descriptor.get.call(obj) || null;  // ✅ 以 a 为 this 调用 getter
            // console.log(`value get: ${value}`);  // "sdf"
            return value;
        }

        return null;
    }

    setOption(opt: Partial<KodoOption>) {
        this.opt = Object.assign(this.opt, opt);
    }

    // linkExpression(expression: string, params?: string[]): void {
    //     //expression: ((a == b && a <> c) || (b like "Armstrong"))
    //     //Need a volunteer who's familar w/ complier | interpreter to coding on this...
    // }

    registerTranslator(translator: INodeTranslator) {
        translator.kodo = this;
        this.translators.push(translator);
    }

    registerProvider(ns: string, provider: IDataProvider) {
        provider.kodo = this;
        this.providers.set(ns, provider);
    }

    registerClass<T>(cls: Constructor<T>): void;
    registerClass<T>($ns: NodeNamespace<T>): void;
    registerClass<T>(input: NodeNamespace<T> | Constructor<T>): void {
        if (typeof input === "function") {
            this.classMap[input.name] = input;
        }
    }

    registerNotifier(n: INotifier): void {
        this.notifier.register(n);
    }

    private hasNamespaceInPath<T>(startup: QueryNode<T>): boolean {
        let dn = startup.$fromDN;
        while (dn) {
            if (dn.$ns === startup.$ns) {
                return true;
            }
            dn = dn.$fromQN?.$fromDN;
        }
        return false;
    }

    private gatherNext(foundList: DataNode<any>[]): QueryNode<any>[] {
        const qns: QueryNode<any>[] = [];
        for (const dn of foundList) {
            for (const t of this.translators) {
                if (!t.match(dn)) { continue; }
                qns.push(...t.translate<any, any>(dn));
            }
        }
        return qns;
    }

    private async loopExplore<T>(startup: QueryNode<T>, exlpreOpt: ExploreOption): Promise<void> {
        if (!this.opt.recursion && this.hasNamespaceInPath(startup)) {
            return;
        }
        if (this.opt.tierLimit) {
            if (exlpreOpt.tierLimit >= this.opt.tierLimit) { return; }
        }

        //let dNodes: DataNode<any>[] = [];
        let foundList: DataNode<any>[] = [];

        let provider = this.providers.get(startup.$ns);
        provider = provider ?? this.providers.get("*");
        if (!provider) {
            throw new Error(`No data-provider serve the ns: ${startup.$ns}`);
        }

        //1.1 query
        let founds = await provider.lookup(startup);
        if (founds.length <= 0) { return; }

        //1.2 try add
        founds.forEach(f => {
            let added = this.nodes.tryAdd(f);
            if (added) { foundList.push(f); }
        });

        const qns = this.gatherNext(foundList);

        //find parallel
        await Promise.all(qns.map(q => this.loopExplore(q, {
            tierLimit: exlpreOpt.tierLimit + 1
        })));
    }

    private initClsMap() {
        for (const t of this.translators) {
            for (const ln of t.linkNodes) {
                this.registerClass(ln.$from);
                this.registerClass(ln.$to);
            }
        }
    }

    async explore<T>(startup: QueryNode<T>): Promise<DataNode<any>[]> {
        if (!this.opt.cache) {
            this.nodes.clear();
        }

        if (!this.inited) {
            this.initClsMap();
        }

        if (!startup.$id) {
            startup.$id = `qn-startup.${startup.$ns}..${generateHashCode()}`;
        }
        await this.loopExplore(startup, {
            tierLimit: 0
        });

        return this.nodes.getList();
    }

    async checkRules(rules: NotificationRule[], nodes?: DataNode<any>[]): Promise<RuleViolation[]> {
        const targets = nodes ?? this.nodes.getList();
        const engine = new NotificationEngine(this.notifier);
        return engine.check(rules, targets);
    }
}

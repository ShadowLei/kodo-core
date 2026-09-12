import { DataNode, DataNodeMap, LinkNode, QueryNode } from "./nodes";
import { IDataProvider } from "./providers";
import { INodeTranslator } from "./translators";
import { generateHashCode } from "./utils";

export interface ExploreOption {
    tierLimit: number;
}

export interface KodoOption extends ExploreOption {
    cache: boolean;
    recursion: boolean;
}

//It's bulky, but it's powerful
export class Kodo {

    translators: INodeTranslator[];
    providers: Map<string, IDataProvider>;
    nodes: DataNodeMap;
    opt: KodoOption;

    private getDefaultOption(opt?: Partial<KodoOption>): KodoOption {
        let defaultOpt: KodoOption = {
            cache: true,
            recursion: true,
            tierLimit: 0
        };

        let theOpt = Object.assign(defaultOpt, opt || {});
        return theOpt;
    }

    constructor(protected name: string, opt?: Partial<KodoOption>) {
        this.translators = [];
        this.providers = new Map();
        this.nodes = new DataNodeMap();
        this.opt = this.getDefaultOption(opt);
    }

    setOption(opt: Partial<KodoOption>) {
        this.opt = Object.assign(this.opt, opt);
    }

    linkExpression(expression: string, params?: string[]): void {
        //TODO here:
        //expression: ((a == b && a <> c) || (b like "Armstrong"))
        //Need a volunteer who's familar w/ complier | interpreter to coding on this...
    }

    registerTranslator(translator: INodeTranslator) {
        this.translators.push(translator);
    }

    registerProvider(ns: string, provider: IDataProvider) {
        this.providers.set(ns, provider);
    }

    private async loopExplore<T>(startup: QueryNode<T>, exlpreOpt: ExploreOption): Promise<void> {
        if (!this.opt.recursion) {
            if (this.nodes.existNS(startup.$ns)) {
                return;
            }
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

        if (this.opt.recursion) {
            //find parallel

            let tasks: Promise<void>[] = [];
            foundList.map(dn => {

                this.translators.map(t => {
                    if (!t.match(dn)) { return; }

                    //2. translate
                    let qn = t.translate<any, any>(dn);

                    qn.map(q => {
                        tasks.push(this.loopExplore(q, {
                            tierLimit: exlpreOpt.tierLimit + 1
                        }));
                    });
                });
            });

            await Promise.all(tasks);
        } else {
            //find sequence

            for (const dn of foundList) {
                for (const t of this.translators) {
                    if (!t.match(dn)) { continue; }

                    // 2. translate
                    const qn = await t.translate<any, any>(dn);

                    for (const q of qn) {
                        await this.loopExplore(q, {
                            tierLimit: exlpreOpt.tierLimit + 1
                        });
                    }
                }
            }
        }
    }

    async explore<T>(startup: QueryNode<T>): Promise<DataNode<any>[]> {
        if (!this.opt.cache) {
            this.nodes.clear();
        }

        if (!startup.$id) {
            let qnid = generateHashCode(startup);
            startup.$id = `qn-${startup.$ns}-$startup-${qnid}`;
        }
        await this.loopExplore(startup, {
            tierLimit: 0
        });

        return this.nodes.getList();
    }
}

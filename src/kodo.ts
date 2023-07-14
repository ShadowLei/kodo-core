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

    private translators: INodeTranslator[];
    private providers: IDataProvider[];
    private nodes: DataNodeMap;
    private opt: KodoOption;

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
        this.providers = [];
        this.nodes = new DataNodeMap();
        this.opt = this.getDefaultOption(opt);
    }

    setOption(opt: Partial<KodoOption>) {
        this.opt = Object.assign(this.opt, opt);
    }

    linkExpression(expression: string, params?: string[]): void {
        //TODO here:
        //this.expressions.push(expression);
    }

    registerTranslator(translator: INodeTranslator) {
        this.translators.push(translator);
    }

    registerProvider(provider: IDataProvider) {
        this.providers.push(provider);
    }

    loopExplore<T>(startup: QueryNode<T>, exlpreOpt: ExploreOption): void {
        if (!this.opt.recursion) {
            if (this.nodes.existNS(startup.$ns)) { return; }
        }
        if (this.opt.tierLimit) {
            if (exlpreOpt.tierLimit >= this.opt.tierLimit) { return; }
        }

        //let dNodes: DataNode<any>[] = [];
        let foundList: DataNode<any>[] = [];

        //1. load data from provider
        this.providers.forEach(p => {

            //1. query
            let founds = p.lookup(startup);
            
            founds.forEach(f => {
                let added = this.nodes.tryAdd(f);
                if (added) { foundList.push(f); }
            });
        });

        if (foundList.length <= 0) { return; }

        foundList.forEach(dn => {
            
            this.translators.forEach(t => {
                if (!t.match(dn)) { return; }

                //2. translate
                let qn = t.translate<any, any>(dn);
                
                //3. continue search
                qn.forEach(q => {
                    this.loopExplore(q, {
                        tierLimit: exlpreOpt.tierLimit + 1
                    });
                });
            });
        });
    }

    explore<T>(startup: QueryNode<T>): DataNode<any>[] {
        if (!this.opt.cache) {
            this.nodes.clear();
        }

        if (!startup.$id) {
            let qnid = generateHashCode(startup);
            startup.$id = `qn-${startup.$ns}-$startup-${qnid}`;
        }
        this.loopExplore(startup, {
            tierLimit: 0
        });
        
        return this.nodes.getList();
    }
}

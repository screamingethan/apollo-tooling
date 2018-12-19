import { GraphQLProject, DocumentUri } from "./base";
import { LoadingHandler } from "../loadingHandler";
import { FileSet } from "../fileSet";
import { ServiceConfig } from "../config";
import { ClientIdentity } from "../engine";
import Uri from "vscode-uri";

export function isServiceProject(
  project: GraphQLProject
): project is GraphQLServiceProject {
  return project instanceof GraphQLServiceProject;
}

export interface GraphQLServiceProjectConfig {
  clientIdentity?: ClientIdentity;
  config: ServiceConfig;
  rootURI: DocumentUri;
  loadingHandler: LoadingHandler;
}
export class GraphQLServiceProject extends GraphQLProject {
  constructor({
    clientIdentity,
    config,
    rootURI,
    loadingHandler
  }: GraphQLServiceProjectConfig) {
    const fileSet = new FileSet({
      rootPath: Uri.parse(rootURI).fsPath,
      includes: config.service.includes,
      excludes: config.service.excludes
    });

    super({ config, fileSet, loadingHandler, clientIdentity });
    this.config = config;
  }

  get displayName() {
    return this.config.name || "Unnamed Project";
  }

  initialize() {
    return [];
  }

  validate() {}

  getProjectStats() {
    // use this to remove primitives and internal fields for stats
    const filterTypes = (type: string) =>
      !/__.*|Boolean|ID|Int|String|Float/.test(type);

    const serviceTypes = this.schema
      ? Object.keys(this.schema.getTypeMap()).filter(filterTypes).length
      : 0;

    return {
      loaded: true,
      serviceId: this.displayName(),
      types: {
        service: serviceTypes,
        client: 0,
        total: serviceTypes
      },
      tag: this.config.tag,
      lastFetch: this.lastLoadDate
    };
  }
}

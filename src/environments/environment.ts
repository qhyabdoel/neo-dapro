// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  api_url: 'http://studio.paques.id:8081',
  api_paths: {
    datasetAliasSave: '/api/query/dsalias/save',
    explorerCheck: 'api/explorer/check',
    explorerDir: '/api/explorer/dir',
    explorerDirV2: '/api/v2/explorer/create-dir',
    explorerList: '/api/explorer/list',
    explorerListV2: '/api/v2/explorer/list',
    explorerCp: '/api/explorer/cp',
    explorerMv: '/api/explorer/mv',
    explorerMvV2: '/api/v2/explorer/mv',
    explorerRm: '/api/explorer/rm',
    explorerUpload: 'api/explorer/upload',
    explorerUploadV2: 'api/v2/explorer/upload',
    queryDelete: '/api/query/delete',
    explorerSearchV2: '/api/v2/explorer/search',
    exploreHdfsConnection: '/api/hdfs-connection'
  },
  authTokenKey: 'authce9d77b308c149d5992a80073637e4d5',
  core: 'new',
  production: false,
  type: 'on_premise',
  isSlotLineDebuggingActive: false,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

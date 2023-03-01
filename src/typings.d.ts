/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
	id: string;
}

declare var KTMenu: any;
declare var KTOffcanvas: any;
declare var KTScrolltop: any;
declare var KTHeader: any;
declare var KTToggle: any;
declare var KTUtil: any;
declare var KTPortlet: any;
declare var KTDialog: any;
declare var KTWizard: any;
declare var Chart: any;
declare module "*.json" {
    const value: any;
    export default value;
}

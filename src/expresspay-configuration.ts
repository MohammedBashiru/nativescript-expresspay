export class Configuration {
    private SANDBOX_URL:string = "https://sandbox.expresspaygh.com/";
    private PRODUCTIOIN_URL:string = "https://expresspaygh.com/";
    private SANDBOX_SERVER_URL:string = "https://sandbox.expresspaygh.com/api/sdk/php/server.php";
    private mProductionUrl:string;
    private mSandBoxUrl:string;
    private mSandBoxServerUrl:string;
    private sandBoxMode: boolean;

    constructor(sandBoxServerUrl: string){
        this.mProductionUrl = this.PRODUCTIOIN_URL;
        this.mSandBoxUrl = this.SANDBOX_URL;
        this.mSandBoxServerUrl = sandBoxServerUrl == null ? this.SANDBOX_SERVER_URL : sandBoxServerUrl;
        this.sandBoxMode = true;
    } 

    public getClientApiUrl(){
        return this.sandBoxMode ? this.mSandBoxUrl : this.mProductionUrl;
    }

    public getMyServerUrl() {
        return this.mSandBoxServerUrl;
    }

    public isSandBoxMode() {
        return this.sandBoxMode;
    }

    public enableSandBox(enable: boolean) :void {
        this.sandBoxMode = enable;
    }

    public setMyServerUrl(url: string) : void {
        this.mSandBoxServerUrl = url;
    }
}
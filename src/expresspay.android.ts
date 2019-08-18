import * as app from "tns-core-modules/application";
import * as http from 'tns-core-modules/http'
import { PayLoad, RequestType } from './expresspay.common'
import { ExpressPayBrowserSwitchActivity } from './expresspay-browser-switch-activity'


export class Expresspay {
    private __payload: PayLoad;
    private __clientToken: string;
    private __orderId: string;
    private SANDBOX_URL:string = "https://sandbox.expresspaygh.com/";
    private PRODUCTIOIN_URL:string = "https://expresspaygh.com/";

    constructor(payload){
        this.__payload = payload
    }

    get getMyServerUrl(): string {
        return this.__payload.server_url || "https://sandbox.expresspaygh.com/api/sdk/php/server.php"
    }

    get params(): PayLoad {
        return this.__payload
    }

    get isSandBoxMode(): boolean {
        return this.__payload.enable_debug? true : false
    }

    set mRedirectUrl(url : string ){
        this.__payload.redirect_url = url
    }

    get mRedirectUrl(): string{
        return this.__payload.redirect_url
    }

    set mClientToken(token: string){
        this.__clientToken = token
    }

    get mClientToken(): string{
        return this.__clientToken
    }

    set mOrderId(order_id: string){
        this.__orderId = order_id
    }

    get mOrderId(): string {
        return this.__orderId;
    }

    get getClientApiUrl(): string {
        return this.isSandBoxMode? this.SANDBOX_URL : this.PRODUCTIOIN_URL
    }

    getToken(): Promise<any> {
        let url = this.getMyServerUrl;
        return http.request({
            url: url,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify(this.params)
        }).then((response) => {
            try {
                let jsonResponse = response.content.toJSON();
                if ( this.isSandBoxMode ) {
                    console.log("expressPayDebugSubmit", jsonResponse);
                }
                let status = jsonResponse.status;
                let errorMessage;

                if (status == 1 ) {
                    this.mRedirectUrl = jsonResponse['redirect-url'];
                    this.mClientToken = jsonResponse.token;
                    if (this.mRedirectUrl && this.mRedirectUrl != null) {
                        errorMessage = jsonResponse.message;
                        let resolveData = { jsonResponse: jsonResponse, errorMessage: errorMessage}
                        return Promise.resolve(resolveData)
                    } else {
                        let resolveData = { jsonResponse: null, errorMessage: "Redirect Url is required in the response."}
                        return Promise.resolve(resolveData)
                    }
                } else {
                    let resolveData = { jsonResponse: null, errorMessage: errorMessage}
                    return Promise.resolve(resolveData)
                }
            } catch (var5) {
                let resolveData = { jsonResponse: null, errorMessage: "General Error"}
                return Promise.reject(resolveData)
            }
        }, (error) => {
            console.trace(error);
            let resolveData = { jsonResponse: null, errorMessage: error.getLocalizedMessage()}
            return Promise.reject(resolveData)
        });
    }

    checkoutPayment(): Promise<Object>{
        const that = this
        return new Promise((resolve, reject) => {
            let PAYMENT_RESULT_CODE = 1

            app.android.on(app.AndroidApplication.activityResultEvent, onResult);

            function onResult(args){
                let requestCode = args.requestCode;
                let responseCode = args.resultCode;
                let data = args.intent;

                if ( requestCode == PAYMENT_RESULT_CODE ){
                    let errorMsg;
                    let token;
                    if (responseCode == 1000 && data != null) {
                        errorMsg = data.getStringExtra("com.expresspaygh.api.ExpressPayBrowserSwitchActivity.ORDER_ID");
                        token = data.getStringExtra("com.expresspaygh.api.ExpressPayBrowserSwitchActivity.TOKEN");

                        if (errorMsg != null) {
                            this.mOrderId = errorMsg;
                        }
            
                        if (token != null) {
                            this.mClientToken = token;
                        }

                        //let resolveData = { paymentCompleted: true, errorMessage: errorMsg }
                        app.android.off(app.AndroidApplication.activityResultEvent, onResult);
                        resolve(that.checkPaymentStatus())
                        return;
                    } else if (responseCode == 1001) {
                        errorMsg = data.getStringExtra("com.expresspaygh.api.ExpressPayBrowserSwitchActivity.ERROR_MESSAGE");
                        let resolveData = { paymentCompleted: false, errorMessage: errorMsg }
                        app.android.off(app.AndroidApplication.activityResultEvent, onResult);
                        resolve(resolveData)
                        return;
                    } else if (responseCode == 1002) {
                        let resolveData = { paymentCompleted: false, errorMessage: "User cancelled the payment" }
                        app.android.off(app.AndroidApplication.activityResultEvent, onResult);
                        resolve(resolveData)
                        return;
                    }
                }else {
                    app.android.off(app.AndroidApplication.activityResultEvent, onResult);
                    reject(new Error("Expresspay activity result code " + requestCode));
                    return;
                }
            }

            let context = app.android.context
            let Intent = android.content.Intent;
            let expressPayIntent = new Intent(context, ExpressPayBrowserSwitchActivity["class"]).setFlags(536936448);
            let url: string = this.getClientApiUrl + "api/checkout.php?token=" + this.mClientToken;
            let redirectUrl: string = this.mRedirectUrl;
            expressPayIntent.putExtra("com.expresspaygh.api.ExpressPayBrowserSwitchActivity.URL", url);
            expressPayIntent.putExtra("com.expresspaygh.api.ExpressPayBrowserSwitchActivity.REDIRECT_URL", redirectUrl);
            if ( expressPayIntent != null ) {
                app.android.foregroundActivity.startActivityForResult(expressPayIntent, PAYMENT_RESULT_CODE)
            }
        })
    }

    checkPaymentStatus(): Promise<Object>{
        return http.request({
            url: this.getMyServerUrl,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                request: RequestType.Query,
                token: this.mClientToken
            })
        }).then((response) => {
            try {
                let jsonResponse = response.content.toJSON();
                if ( this.isSandBoxMode ) {
                    console.log("expressPayDebugQuery", jsonResponse);
                }

                let status = jsonResponse.result;
                let success: boolean = false;
                if ( status == 1 ) {
                    success = true;
                }
                let message: string = jsonResponse["result-text"];
                let resolveData = { paymentSuccessful: success, jsonResponse: jsonResponse, errorMessage: message }
                return Promise.resolve(resolveData)
            } catch (var6) {
                let resolveData = { paymentSuccessful: false, jsonResponse: null, errorMessage: "General Error" }
                return Promise.reject(resolveData)
            }

        }, (error) => {
            let resolveData = { paymentSuccessful: false, jsonResponse: null, errorMessage: error.message }
            return Promise.reject(resolveData)
        });
    }
} 

export function initialize(payload: PayLoad): Expresspay{
    return new Expresspay(payload)
}
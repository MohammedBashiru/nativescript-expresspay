
import * as app from 'tns-core-modules/application';
import * as http from 'tns-core-modules/http'
import { Configuration } from './expresspay-configuration';
import { ExpressPayBrowserSwitchActivity } from './expresspay-browser-switch-activity'
const Intent = android.content.Intent;

// NOT BEING USED.
export namespace MainAPI {

    export class ExpressPayApi {
        private mContext: any;
        private mClientToken: string;
        private mOrderId: string;
        private mRedirectUrl: string;
        static mExpressPayPaymentFinishedListener : ExpressPayApiInterface.ExpressPayPaymentCompletionListener = null;
        public static readonly ERROR: number = 1001;
        public static readonly SUCCESS: number = 1000;
        public static readonly CANCELLED: number = 1002;
        public static readonly EXPRESSPAY_WEBVIEW: number = 1;
        private readonly configuration: Configuration;

        constructor(context, yourServerURL){
            this.mContext = context.getApplicationContext();
            this.configuration = new Configuration(yourServerURL);
        }

        protected startPaymentWithExpressPay(activity): boolean {
            let expressPayIntent = (new Intent(this.mContext, ExpressPayBrowserSwitchActivity["class"])).setFlags(536936448);
            let url: string = this.configuration.getClientApiUrl() + "api/checkout.php?token=" + this.mClientToken;
            let redirectUrl: string = this.mRedirectUrl;
            expressPayIntent.putExtra("com.expresspaygh.api.ExpressPayBrowserSwitchActivity.URL", url);
            expressPayIntent.putExtra("com.expresspaygh.api.ExpressPayBrowserSwitchActivity.REDIRECT_URL", redirectUrl);
            if (expressPayIntent != null) {
                app.android.foregroundActivity.startActivityForResult(expressPayIntent, 1)
                return true;
            } else {
                return false;
            }
        }

        public submitAndCheckout(params, activity, listener : ExpressPayApiInterface.ExpressPayPaymentCompletionListener) {
            this.submit(params, activity, new ExpressPayApiInterface.ExpressPayApi$0(this, listener));
        }

        public submit(params, activity, listener: ExpressPayApiInterface.ExpressPaySubmitCompletionListener ): void {
            let url = this.configuration.getMyServerUrl();
            http.request({
                url: url,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify(params)
            }).then((response) => {
                console.log("-------SUBMIT RESPONSE", response)
                // const result = response.content.toJSON();
                try {
                    let jsonResponse = response.content.toJSON();
                    if (this.configuration.isSandBoxMode()) {
                        console.log("expressPayDebugSubmit", jsonResponse);
                    }

                    let status = jsonResponse.status;
                    let errorMessage;
                    if (status == 1 ) {
                        console.log("Got status 1")
                        this.mRedirectUrl = jsonResponse['redirect-url'];
                        console.log("this.mRedirectUrl", this.mRedirectUrl)

                        this.mClientToken = jsonResponse.token;
                        console.log("this.mClientToken", this.mClientToken)
                        if (this.mRedirectUrl && this.mRedirectUrl != null) {
                            console.log("Passed 0001")
                            errorMessage = jsonResponse.message;
                            listener.onExpressPaySubmitFinished(jsonResponse, errorMessage);
                        } else {
                            console.log("Passed 0002")
                            listener.onExpressPaySubmitFinished(null, "Redirect Url is required in the response.");
                        }
                    } else {
                        errorMessage = jsonResponse.getString("message");
                        listener.onExpressPaySubmitFinished(null, errorMessage);
                    }
                } catch (var5) {
                    // var5.printStackTrace();
                    console.log("Passed 0003 ----Error", var5)
                    console.trace(var5)
                    listener.onExpressPaySubmitFinished(null, "General Error");
                }
            }, (error) => {
                console.trace(error);
                listener.onExpressPaySubmitFinished(null, error.getLocalizedMessage());
            });
        }

        public checkout(activity): void {
            try {
                ExpressPayApi.mExpressPayPaymentFinishedListener = activity;
            } catch (var3) {
                throw new Error(activity.toString() + " must implement ExpressPayPaymentCompletionListener");
            }

            if (this.mClientToken != null && this.mRedirectUrl != null) {
                this.checkoutMain(activity, this.mClientToken, this.mRedirectUrl);
            } else {
                ExpressPayApi.mExpressPayPaymentFinishedListener.onExpressPayPaymentFinished(false, "Please make a call to submit before calling this method");
            }
        }

        public checkoutMain(activity, clientToken: string, redirectUrl: string) {
            try {
                // ExpressPayApi.mExpressPayPaymentFinishedListener = (ExpressPayApi.ExpressPayPaymentCompletionListener)activity;
                ExpressPayApi.mExpressPayPaymentFinishedListener =  activity;
            } catch (var5) {
                console.trace(var5)
                console.log("Error 123");
                throw new Error(activity.toString() + " must implement ExpressPayPaymentCompletionListener");
            }
            this.mClientToken = clientToken;
            this.mRedirectUrl = redirectUrl;
            if (!this.startPaymentWithExpressPay(activity)) {
                ExpressPayApi.mExpressPayPaymentFinishedListener.onExpressPayPaymentFinished(false, "Unable to display checkout page.");
            }
        }

        public query(token, listener: ExpressPayApiInterface.ExpressPayQueryCompletionListener): void {
            http.request({
                url: this.configuration.getMyServerUrl(),
                method: "POST",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({
                    request: "query",
                    token: token
                })
            }).then((response) => {
                // const result = response.content.toJSON();
                console.log("-------QUERY RESPONSE", response)
                try {
                    let jsonResponse = response.content.toJSON();
                    if (this.configuration.isSandBoxMode()) {
                        console.log("expressPayDebugQuery", response.toString());
                    }

                    status = jsonResponse.getString("result");
                    let success: boolean = false;
                    if (status == '1') {
                        success = true;
                    }

                    let message: string = jsonResponse["result-text"];
                    listener.onExpressPayQueryFinished(success, jsonResponse, message);
                } catch (var6) {
                    // var6.printStackTrace();
                    console.trace(var6);
                    listener.onExpressPayQueryFinished(false, null, "General Error");
                }

            }, (error) => {
                console.trace(error);
                listener.onExpressPayQueryFinished(false, null, error.message);
            });
        }

        public onActivityResult(activity, requestCode: number, responseCode: number, data): void {
            console.log("Activity For Results", requestCode, responseCode)
            let errorMsg;
            if (responseCode == 1000 && data != null) {
                errorMsg = data["com.expresspaygh.api.ExpressPayBrowserSwitchActivity.ORDER_ID"];
                let token = data["com.expresspaygh.api.ExpressPayBrowserSwitchActivity.TOKEN"];
                if (errorMsg != null) {
                    this.mOrderId = errorMsg;
                }
                if (token != null) {
                    this.mClientToken = token;
                }
                ExpressPayApi.mExpressPayPaymentFinishedListener.onExpressPayPaymentFinished(true, "");
            } else if (responseCode == 1001) {
                errorMsg = data["com.expresspaygh.api.ExpressPayBrowserSwitchActivity.ERROR_MESSAGE"];
                ExpressPayApi.mExpressPayPaymentFinishedListener.onExpressPayPaymentFinished(false, errorMsg);
            } else if (responseCode == 1002) {
                ExpressPayApi.mExpressPayPaymentFinishedListener.onExpressPayPaymentFinished(false, "User cancelled the payment");
            }

        }

        public getOrderId(): string {
            return this.mOrderId;
        }

        public getToken(): string {
            return this.mClientToken;
        }

        public setDebugMode(value: boolean): void {
            this.configuration.enableSandBox(value);
        }
    }

    export namespace ExpressPayApiInterface {

        export interface ExpressPayQueryCompletionListener {
            onExpressPayQueryFinished(var1 : boolean, var2 : string, var3 : string);
        }

        export interface ExpressPaySubmitCompletionListener {
            onExpressPaySubmitFinished(var1 : any, var2 : string);
        }

        export interface ExpressPayPaymentCompletionListener {
            onExpressPayPaymentFinished(var1 : boolean, var2 : string);
        }

        export class ExpressPayApi$0 implements ExpressPaySubmitCompletionListener {
            public __parent: any;
            public activity: any;
            public onExpressPaySubmitFinished(response : string, errorMessage : string) {
                if(response != null) {
                    this.__parent.checkoutMain(this.activity, this.__parent.mClientToken, this.__parent.mRedirectUrl);
                } else {
                    this.listener.onExpressPayPaymentFinished(false, errorMessage);
                }
            }

            constructor(__parent: any, private listener: any) {
                this.__parent = __parent;
            }
        }
    }
}
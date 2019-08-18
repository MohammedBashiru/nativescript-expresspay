import {setActivityCallbacks, AndroidActivityCallbacks} from "tns-core-modules/ui/frame";
import * as apiModule from './expresspay-api';
import * as app from 'tns-core-modules/application';
import * as dialogs from 'tns-core-modules/ui/dialogs';


//declare const androidx, android, com, java, org: any;
// declare const com: any;
const HashMap = java.util.HashMap;
const DialogInterface = android.content.DialogInterface;
const AlertDialog = android.support.v7.app.AlertDialog;


// export namespace com.expresspaygh.api {
@JavaProxy("com.expresspaygh.application")
export class MainActivity extends android.support.v7.app.AppCompatActivity implements apiModule.MainAPI.ExpressPayApiInterface.ExpressPayPaymentCompletionListener {
    private _callbacks: AndroidActivityCallbacks;
    static expressPayApi: apiModule.MainAPI.ExpressPayApi

    public onCreate(savedInstanceState: android.os.Bundle): void {
        console.log("onCreate")
        if (!this._callbacks) {
            console.log("setActivityCallbacks")
            setActivityCallbacks(this);
        }

        this._callbacks.onCreate(this, savedInstanceState, super.onCreate);
        
        MainActivity.expressPayApi = new apiModule.MainAPI.ExpressPayApi(this, "https://sandbox.expresspaygh.com/api/sdk/php/server.php");
        MainActivity.expressPayApi.setDebugMode(true);

        // This part has been commented out from the layout
        
        // let btnResourceId = this.getResources().getIdentifier("payBtn", "id", this.getPackageName())
        // let payBtn = this.findViewById(btnResourceId);
        // payBtn.setOnClickListener(new android.view.View.OnClickListener({
        //     onClick: function() {
        //         // Perform action on click
        //         this.pay();
        //     }
        // }));

    }

    public onActivityResult(requestCode: number, resultCode: number, data: android.content.Intent): void {
        super.onActivityResult(requestCode, resultCode, data);
        console.log("ON ACTIVITY RESULT");
        console.log(requestCode + " - " + resultCode);
        
        if( data != null){
            MainActivity.expressPayApi.onActivityResult(this, requestCode, resultCode, data);
        }

        this._callbacks.onActivityResult(this, requestCode, resultCode, data, super.onActivityResult);
    }

    public pay(): void{
        /**
         * Make a request to your server to get a token
         * For this demo we have a sample server which we make the request to.
         * url: https://sandbox.expresspaygh.com/api/sdk/php/server.php
         * In Dev: Use amount 1.00 to simulate a failed transaction and greater than or equals 2.00 for a successful transaction
         */

        let params = new HashMap();
        params.put("request","submit");
        params.put("order_id", "82373");
        params.put("currency", "GHS");
        params.put("amount", "2.00");
        params.put("order_desc", "Daily Plan");
        params.put("user_name","testapi@expresspaygh.com");
        params.put("first_name","Test");
        params.put("last_name","Api");
        params.put("email","testapi@expresspaygh.com");
        params.put("phone_number","233244123123");
        params.put("account_number","233244123123");

        console.log("params", params);

        MainActivity.expressPayApi.submit(params, this, new ExpressPaySubmitCompletionListener({
            onExpressPaySubmitFinished: (responseObj: any, message: string): void => {
                console.log("onExpressPaySubmitFinished", responseObj)
                /**
                 * Once the request is completed this listener is called with the response
                 * if the responseObj is null then there was an error
                 */

                if ( responseObj != null ){
                    //You can access the returned token
                    try {
                        let status: string = responseObj.status;
                        if (status === "1" ) {
                            let token: string = MainActivity.expressPayApi.getToken();
                            this.checkout();
                        }else {
                            console.log("expressPayDemo", message)
                            this.showAlert(message);
                        }
                    } catch (e) {
                        console.trace(e)
                        console.log("error", e, "message", message)
                        this.showAlert(message);

                    }

                } else {
                    console.log("expressPayDemo", message)
                    this.showAlert(message);
                }
            }
        }));
    }

    public checkout(): void {
        /**
         * Displays the payment page to accept the payment method from the user
         *
         * When the payment is complete the ExpressPayPaymentCompletionListener is called
         */

        MainActivity.expressPayApi.checkout(this);
    }

    public queryPayment(token: string): void {
        MainActivity.expressPayApi.query(token, new ExpressPayQueryCompletionListener({
            onExpressPayQueryFinished:(paymentSuccessful: boolean, responseObj: any, message: string): void => {
                if (paymentSuccessful) {
                    console.log("expressPayDemo", message)
                    this.showAlert(message);
                } else {
                    //There was an error
                    console.log("expressPayDemo", message)
                    // Log.d("expressPayDemo", message);
                    this.showAlert(message);
                }
            }
        }));
    }

    onExpressPayPaymentFinished(paymentCompleted: boolean, message: string): void {
        if (paymentCompleted){
            //Payment was completed
            let token: string = MainActivity.expressPayApi.getToken();
            this.queryPayment(token);
        }
        else{
            console.log("expressPayDemo", message)
            this.showAlert(message);
        }
    }

    onExpressPaySubmitFinished(responseObj: any, message: string): void  {
        console.log("onExpressPaySubmitFinished", responseObj)
        /**
         * Once the request is completed this listener is called with the response
         * if the responseObj is null then there was an error
         */

        if ( responseObj != null ){
            //You can access the returned token
            try {
                let status: string = responseObj.status;
                if (status === "1" ) {
                    let token: string = MainActivity.expressPayApi.getToken();
                    this.checkout();
                }else {
                    console.log("expressPayDemo", message)
                    this.showAlert(message);
                }
            } catch (e) {
                console.trace(e)
                console.log("error", e, "message", message)
                this.showAlert(message);

            }

        } else {
            console.log("expressPayDemo", message)
            this.showAlert(message);
        }
    }

    onExpressPayQueryFinished(paymentSuccessful: boolean, responseObj: any, message: string): void {
        if (paymentSuccessful) {
            console.log("expressPayDemo", message)
            this.showAlert(message);
        } else {
            //There was an error
            console.log("expressPayDemo", message)
            // Log.d("expressPayDemo", message);
            this.showAlert(message);
        }
    }

    public showAlert(message: string): void {
        console.log("show dialog")
        dialogs.alert(message)
        .then(() => console.log(`Dialog closed.`));
    }
        
}

export class ExpressPayQueryCompletionListener implements apiModule.MainAPI.ExpressPayApiInterface.ExpressPayQueryCompletionListener {
    public __parent: any;

    onExpressPayQueryFinished(var1: boolean, var2: string, var3: string) {
        throw new Error("Method not implemented.");
    }

    onExpressPaySubmitFinished(responseObj: any, message: string): void {
        console.log("onExpressPaySubmitFinished", responseObj)
        /**
         * Once the request is completed this listener is called with the response
         * if the responseObj is null then there was an error
         */

        if ( responseObj != null ){
            //You can access the returned token
            try {
                let status: string = responseObj.status;
                if (status === "1" ) {
                    let token: string = MainActivity.expressPayApi.getToken();
                    this.__parent.checkout();
                }else {
                    console.log("expressPayDemo", message)
                    this.__parent.showAlert(message);
                }
            } catch (e) {
                console.trace(e)
                console.log("error", e, "message", message)
                this.__parent.showAlert(message);

            }

        } else {
            console.log("expressPayDemo", message)
            this.__parent.showAlert(message);
        }
    }

    constructor(__parent: any) {
        this.__parent = __parent;
    }
}

export class ExpressPaySubmitCompletionListener implements apiModule.MainAPI.ExpressPayApiInterface.ExpressPaySubmitCompletionListener {
    public __parent: any;

    onExpressPaySubmitFinished(var1: any, var2: string) {
        throw new Error("Method not implemented.");
    }

    public onExpressPayQueryFinished(paymentSuccessful: boolean, responseObj: any, message: string): void {
        if (paymentSuccessful) {
            console.log("expressPayDemo", message)
            this.__parent.showAlert(message);
        } else {
            //There was an error
            console.log("expressPayDemo", message)
            // Log.d("expressPayDemo", message);
            this.__parent.showAlert(message);
        }
    }

    constructor(__parent: any) {
        this.__parent = __parent;
    }
}
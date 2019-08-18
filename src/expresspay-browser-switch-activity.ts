import {setActivityCallbacks, AndroidActivityCallbacks} from "tns-core-modules/ui/frame";
const ProgressDialog = android.app.ProgressDialog;
const Uri = android.net.Uri;

@JavaProxy("com.expresspaygh.api.ExpressPayBrowserSwitchActivity")
export class ExpressPayBrowserSwitchActivity extends android.support.v7.app.AppCompatActivity {
    private _callbacks: AndroidActivityCallbacks;
    private webView: any;
    private pDialog: any;
    public __parent: any;

    public static readonly REDIRECT_URL: string = "com.expresspaygh.api.ExpressPayBrowserSwitchActivity.REDIRECT_URL";
    public static readonly URL: string = "com.expresspaygh.api.ExpressPayBrowserSwitchActivity.URL";
    public static readonly ERROR_MESSAGE: string = "com.expresspaygh.api.ExpressPayBrowserSwitchActivity.ERROR_MESSAGE";
    public static readonly ORDER_ID: string = "com.expresspaygh.api.ExpressPayBrowserSwitchActivity.ORDER_ID";
    public static readonly TOKEN: string = "com.expresspaygh.api.ExpressPayBrowserSwitchActivity.TOKEN";
    protected mRedirectUrl: string;
    protected url: string;

    public onCreate(savedInstanceState: android.os.Bundle): void {
        if (!this._callbacks) {
            console.log("setActivityCallbacks")
            setActivityCallbacks(this);
        }

        this._callbacks.onCreate(this, savedInstanceState, super.onCreate);
        
        //this.getWindow().setBackgroundDrawableResource(17170445);
        let window: any = this.getWindow();
        window.setBackgroundDrawableResource(17170445);
        window.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);

        let layout = this.getResources().getIdentifier("expresspay_browser_switch_activity", "layout", this.getPackageName())
        this.setContentView(layout);
        this.mRedirectUrl = this.getIntent().getStringExtra("com.expresspaygh.api.ExpressPayBrowserSwitchActivity.REDIRECT_URL");
        this.url = this.getIntent().getStringExtra("com.expresspaygh.api.ExpressPayBrowserSwitchActivity.URL");
        let resourceId = this.getResources().getIdentifier("expresspay_webview", "id", this.getPackageName())

        this.webView = this.findViewById(resourceId);
        this.webView.getSettings().setJavaScriptEnabled(true);
        this.pDialog  = new ProgressDialog(this);
        this.pDialog.setMessage("Loading...");
        this.pDialog.show();

        this.webView.setWebViewClient(new WebViewClient(this))
        this.webView.loadUrl(this.url);
    }

    public clearUpWebView(webView): void {
        webView.clearCache(true);
        webView.clearHistory();
    }

    public onBackPressed(): void {
        this._callbacks.onBackPressed(this, super.onBackPressed);

        let intent = this.getIntent();
        this.setResult(1002, intent);
        this.finish();
    }
}

export class WebViewClient extends android.webkit.WebViewClient {

    public __parent: any;

    constructor(__parent: any) {
        super();
        this.__parent = __parent;
    }

    public onPageStarted(view, url, favicon): void {
        let uri = Uri.parse(url);
        let cancel = uri.getQueryParameter("cancel");
        let intent;

        if (cancel != null && cancel) {
            intent = this.__parent.getIntent();
            this.__parent.setResult(1002, intent);
            this.__parent.pDialog.dismiss();
            this.__parent.clearUpWebView(this.__parent.webView);
            this.__parent.finish();
        }

        if (url.includes("retry_later.php")) {
            intent = this.__parent.getIntent();
            intent.putExtra("com.expresspaygh.api.ExpressPayBrowserSwitchActivity.ERROR_MESSAGE", "Sorry we are unable to process your request. Please retry your checkout again.");
            this.__parent.setResult(1001, intent);
            this.__parent.pDialog.dismiss();
            this.__parent.clearUpWebView(this.__parent.webView);
            this.__parent.finish();
        }

        if (url.includes(this.__parent.mRedirectUrl)) {
            let orderID: string = uri.getQueryParameter("order-id");
            let token: string = uri.getQueryParameter("token");
            let intentx = this.__parent.getIntent();
            this.__parent.setResult(1000, intentx);
            if (orderID != null) {
                intentx.putExtra("com.expresspaygh.api.ExpressPayBrowserSwitchActivity.ORDER_ID", orderID);
            }

            if (token != null) {
                intentx.putExtra("com.expresspaygh.api.ExpressPayBrowserSwitchActivity.TOKEN", token);
            }
            
            this.__parent.pDialog.dismiss();
            this.__parent.clearUpWebView(this.__parent.webView);
            this.__parent.finish();
        }

    }

    public onPageFinished(view, url): void {
        if (url) {
            this.__parent.pDialog.dismiss();
        }
    }
}
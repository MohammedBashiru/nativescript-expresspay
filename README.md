# Nativescript Expresspay

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

This plugin allows you to use expresspay-gh payment platform with Nativescript. For more information visit https://expresspaygh.com/

## Requirements

  - Add ```expresspay_browser_switch_activity.xml ``` to ```AppResources/Android/src/main/res/layout```
  ```xml <?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools" 
    android:id="@+id/layout"
    android:layout_width="match_parent"
    android:layout_height="match_parent" android:paddingLeft="@dimen/activity_horizontal_margin"
    android:paddingRight="@dimen/activity_horizontal_margin"
    android:paddingTop="@dimen/activity_vertical_margin"
    android:paddingBottom="@dimen/activity_vertical_margin">
     />
    <WebView xmlns:android="http://schemas.android.com/apk/res/android"
        android:layout_width="match_parent" 
        android:layout_height="match_parent"
        android:id="@+id/expresspay_webview">
    </WebView>
</RelativeLayout>
```
- Add ```dimens.xml ``` to ```AppResources/Android/src/main/res/values```
```xml
<resources>
    <!-- Default screen margins, per the Android Design guidelines. -->
    <dimen name="activity_horizontal_margin">16dp</dimen>
    <dimen name="activity_vertical_margin">16dp</dimen>
</resources>
```
- Add the expresspay browser activity to your ```AndroidManifest.xml``` probably add it before the ```ErrorReportActivity``` activity

```xml
<activity
android:name="com.expresspaygh.api.ExpressPayBrowserSwitchActivity"
android:exported="false">
<intent-filter>
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <data android:scheme="${applicationId}.expresspaygh" />
</intent-filter>

<meta-data
    android:name="android.webkit.WebView.EnableSafeBrowsing"
    android:value="true" />
</activity>
```

## Installation
```javascript
tns plugin add nativescript-expresspay
```

## Usage 

The best way to explore the usage of the plugin is to inspect both demo apps in the plugin repository. 
In `demo` folder you can find the usage of the plugin.

In addition to the plugin usage, both apps are webpack configured.

In short here are the steps:

### Import the plugin

*TypeScript*
``` 
import * as Expresspay from 'nativescript-expresspay';
```

*Javascript*
``` 
var Expresspay = require("nativescript-expresspay");
```

### Start Expresspay

*TypeScript*
``` 
let context = Expresspay.initialize({
    request: Expresspay.RequestType.Submit,
    server_url: "http://172.20.10.5/custom/demo.expresspay.com/server.php", // specifiy your server url to generate token
    enable_debug: true,
    order_id: "82373",
    currency: "GHS",
    amount: "2.00",
    order_desc: "Daily Plan",
    first_name: "Test",
    last_name: "Api",
    email: "testapi@expresspaygh.com",
    phone_number: "233546891427",
    account_number: "233546891427"
});
```

*Javascript*
````
var context = Expresspay.initialize({
    request: "submit",
    server_url: "http://172.20.10.5/custom/demo.expresspay.com/server.php", // specifiy your server url to generate token
    enable_debug: true,
    order_id: "82373",
    currency: "GHS",
    amount: "2.00",
    order_desc: "Daily Plan",
    first_name: "Test",
    last_name: "Api",
    email: "testapi@expresspaygh.com",
    phone_number: "233546891427",
    account_number: "233546891427"
});
````
### Full usage

```
context
    .getToken()
    .then((response) => {
      console.log("Payload response", response)
      return context.checkoutPayment()
    })
    .then((response) => {
      console.log("PAYMENT COMPLETED", response)
    })
    .catch((e) => {
      console.log(e);
    });
```

## API

### Methods

| Option | Status | Default | Description |
| ------ | ------ | ------ | ------ |
| request | required | null | Set server request type
| enable_debug | optional | false | Set the developnment env. Please ensure you set this value to false in your production code. This helps to log server response
| server_url | optional | https://sandbox.expresspaygh.com/api/sdk/php/server.php | the full path url to the location on your servers where you implement express pay server side sdk 
| currency | required | null | Currency of the transaction
| amount | required | null | Amount the customer is paying for the order
| order_id | required | null |  Unique order identification number
| order_desc | required | null |  Description of the order
| account_number | required | null |  Customer account number at Merchant
| redirect_url | optional | null |  URL that customer should be redirected at the completion of the payment process
| order_img_url | optional | null |  Image that customer should be shown at Checkout. This must be implemented from server side
| first_name | optional | null |  Customer First name
| last_name | optional | null |  Customer Last name
| phone_number | optional | null |  Customer email address
| email | optional | null |  Customer Last name

## Contribute
We love PRs!. If you want to contribute, but you are not sure where to start - look for [issues labeled `help wanted`](https://github.com/MohammedBashiru/nativescript-expresspay/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22).

## Get Help 
Please, use [github issues](https://github.com/MohammedBashiru/nativescript-expresspay/issues) strictly for reporting bugs or requesting features. For general questions and support, check out [Stack Overflow](https://stackoverflow.com/questions/tagged/nativescript) or ask our experts in [NativeScript community Slack channel](http://developer.telerik.com/wp-login.php?action=slack-invitation).


    
## License

Apache License Version 2.0, January 2019

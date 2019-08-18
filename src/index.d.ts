
export class Expresspay {
  /**
  * Call this before 'checkoutPayment' to generate valid token from the server
  */
  getToken(): Promise<Object>;

  /**
  * Present the expresspay payment UI.
  * The result will be an an object with paymentStatus && errorMessage.
  */
  checkoutPayment(): Promise<Object>;

  /**
  * Confirms the payment status
  * The result will be an an object with paymentCompleteStatus && errorMessage.
  */
  checkPaymentStatus(): Promise<Object>;
}


export declare const enum RequestType {
  Submit = "submit",
  CreateInvoice = "create_invoice",
  Query = "query"
}

interface PayLoad {

  /**
   * Set server request type
   * You can ignore this value if your server thats not rely on this.
   */
  request?: RequestType

  /**
   * Set the developnment env
   * Please ensure you set this value to false in your production code
   * This helps to log server response
   */
  enable_debug?: boolean

  /**
   * the full path url to the location on your servers where you implement our server side sdk
   * if null it defaults to https://sandbox.expresspaygh.com/api/sdk/php/server.php
   */
  server_url?: string
  
  /**
   * Currency of the transaction
   */
  currency: string

  /**
   * Amount the customer is paying for the order
   */
  amount: any

  /**
  * Unique order identification number
  */
  order_id: string

  /**
  * Description of the order
  */
  order_desc: string

  /**
  * Customer account number at Merchant
  */
  account_number: any

  /**
  * URL that customer should be redirected at the completion of the payment process [ optional ]
  */
  redirect_url?: string

  /**
  * Image that customer should be shown at Checkout [ optional ]
  */
  order_img_url?: string

  /**
  * Customer First name [ optional ]
  */
  first_name?: string

  /**
  * Customer Last name [ optional ]
  */
  last_name?: string

  /**
  * Customer Phone Number [ optional ]
  */
  phone_number?: string

  /**
  * Customer email address
  */
  email?: string

} 

/**
 * @param {PayLoad} [options] - options for the express pay request.
 */
export function initialize(payload?: PayLoad): Expresspay;
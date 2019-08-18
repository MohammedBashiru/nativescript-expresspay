import { Observable } from 'tns-core-modules/data/observable';
import * as Expresspay from 'nativescript-expresspay';

export class MainViewModel extends Observable {
  public message: string;

  constructor() {
    super();
  }

  public initPayment(args){
    console.log("button clicked")
    let context = Expresspay.initialize({
      request: Expresspay.RequestType.Submit,
      server_url: "http://172.20.10.5/custom/demo.expresspay.com/server.php",
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
    })
    this.startPayment(context)
  }

  public startPayment(context){
    context
    .getToken()
    .then((response) => {
      console.log("we back with response", response)
      return context.checkoutPayment()
    })
    .then((response) => {
      console.log("PAYMENT COMPLETED", response)
    })
    .catch((e) => {
      console.log(e);
    });
  }

}

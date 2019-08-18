<template>
    <Page>
        <ActionBar title="Demo"/>
        <StackLayout>
          <Button class="btn btn-primary" text="Start Payment" @tap="initPayment()"></Button>
        </StackLayout>
    </Page>
</template>

<script >
  import * as Expresspay from 'nativescript-expresspay';
  export default {
    data() {
      return {}
    },
    methods: {
      initPayment(args){
        let context = Expresspay.initialize({
          request: "submit",
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
      },
      startPayment(context){
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
  }
</script>

<style scoped>
    ActionBar {
        background-color: #53ba82;
        color: #ffffff;
    }

    .message {
        vertical-align: center;
        text-align: center;
        font-size: 20;
        color: #333333;
    }
</style>

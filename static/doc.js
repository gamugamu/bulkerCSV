
Vue.component('productlist', {
  template: `
    <div>
      <div v-for="(product, index)  in products" v-bind:class="{one_line : true, product_hilighed : true, tooltipped : true}" v-on:mouseover="mouseOver">
        <img  class="product_result " :src="product._source.image_link_https"  :alt="index">
      </div>
    </div>
  `,computed: {
  },
  data: function () {
      return {
          products: []
      };
  },
  methods: {
     mouseOver: function(e){
       var idx = e.target.alt

        console.log(this.products[idx]._source);
     }
  },
})

var app = new Vue({
  el: '#app',
  delimiters: ['${', '}'],
  methods: {
    change: function(e, value) {
      //receive the value selected (return an array if is multiple)
      console.log("changedValue", e.target.value, this.$refs.productlist)
      //console.log(this.$refs.value);
      var arg   = { "color" : e.target.value }
      var _this = this

      axios.post('match', {
        value: arg
      })
      .then(function (response) {
        console.log("response", response, "data: ", response.data);
        console.log("---> ", _this.$refs.productlist.products );
        _this.$refs.productlist.products = response.data
      })
      .catch(function (error) {
        console.log("error:", error);
      });
    }
  },
  data:{
  },
  watch: {
    }
});

var elem      = document.querySelector('select');
var instance  = M.FormSelect.init(elem);
console.log("done");

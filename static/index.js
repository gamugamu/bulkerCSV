
Vue.use(VueMaterial.default)

Vue.component('productlist', {
  template: `
    <div id="productlist">
      <div class="relative hoverable" v-for="(product, index)  in products" v-bind:class="{one_line : true, product_hilighed : true, tooltipped : true}" v-on:click="clicked(index)" v-on:mouseover="mouseOver">
        <img  class="product_result " :src="product._source.image_link_https"  :alt="index">
        <div v-if="product._source.condition == 'new'" class="sticker white-text">NEW</div>
        <md-tooltip md-direction="top">{{product._source.title}}</md-tooltip>
        <div class="uuid white-text">{{product._source.price}} €</div>
        <div class="price white-text">{{product._source.id}}</div>
        <product_interest ref="product_interest"></product_interest>
        <div v-if="product._source.rating" class="rating gray-text">☆{{product._source.rating}}</div>
        <div class="taille red-text"><b>{{product._source.taille}}</b></div>
      </div>
      </br>
        <md-progress-bar class="loader_oneline" v-if="this.$parent.is_performing_request" md-mode="indeterminate"></md-progress-bar>
      </br>
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
       if(this.products[idx]){
         console.log(this.products[idx]._source);
      }
    },
    clicked:function(e){
      console.log("clicked", this.$refs, e);
      this.$refs["product_interest"][e].add_interest(1)
    },
    handleScroll: function (event) {
           // your code here
      //console.log("scroll", event);
      // example use
      var div = document.getElementById('productlist');
      console.log(div.offsetTop);
      var is_out_bound  =  div.getBoundingClientRect().top + div.clientHeight - window.innerHeight <= 0

      if (is_out_bound){
        this.$parent.ask_next_page()
      }
    }
  },
  created: function () {
      window.addEventListener('scroll', this.handleScroll);
  },

  destroyed: function () {
      window.removeEventListener('scroll', this.handleScroll);
  }
})

Vue.component('product_interest', {
  template: `
    <div>
        <transition name="fade">
          <div class="add_interest" v-if="this.interest != 0">
            {{interest}}
          </div>
        </transition>
    </div>
  `,
  data: function () {
      return {
          interest: 0
      };
  },
  methods: {
    add_interest: function (incr) {
      this.interest = (this.interest + 1) % 6
   }
}
})

Vue.component('pagination', {
  template: `
    <div>
      <button v-for="(item, index) in this.$parent.total_pages"
      class="btn-flat waves-light" :key="item.id" v-on:click="show(item)">{{item}}</button>
    </div>
  `,computed: {
  },
  data: function () {
      return {
          pages: 10
      };
  },
  methods: {
    show: function (idx) {
      console.log("show", idx) // someValue
      this.$parent.taped_page = idx
    //  this.elastic_filter["page"] = idx
   },
    submit: function (msg, e) {
      e.stopPropagation()
      console.log(msg) // someValue
    },
     mouseOver: function(e){
       var idx = e.target.alt
       if(this.products[idx]){
         console.log(this.products[idx]._source);
      }
     }
  },
  watch: {
      'pages': function(val, oldVal){
        console.log('page changed', val);
      },
    }
})

var app = new Vue({
  el: '#app',
  delimiters: ['${', '}'],
  methods: {
    // fait la requete elasticpath pour retrouver les produits filtrés
    axio_call: function(arg, has_delta=false){
      var _this = this

      // refuse l'appel si vide.
      if( Object.keys(arg).length && this.is_performing_request == false){
        this.is_performing_request = true;

        setTimeout(function(){
          axios.post('match', {
            value: arg,
            from_pages: _this.current_page + 1
          })
          .then(function (response) {
            if(has_delta && _this.delta_page < 3){
              // append
              _this.delta_page += 1;
              _this.$refs.productlist.products.push.apply(_this.$refs.productlist.products, response.data["data"])
              _this.total_pages = response.data["total_pages"] * _this.delta_page
            }else{
              // reinit
              _this.$refs.productlist.products = response.data["data"]
              _this.total_pages = response.data["total_pages"]
              _this.delta_page  = 0
              // scroll to offsetY productlist
              var div = document.getElementById('productlist');
              console.log(div.offsetTop);
              window.scrollTo(0, div.offsetTop);
            }

            _this.current_page  = response.data["current_page"]
            _this.total_pages   = response.data["total_pages"]
            _this.hits          = response.data["hits"]
            console.log("________current_page", _this.current_page, _this.total_pages );
            _this.is_performing_request = false;
          })
          .catch(function (error) {
            console.log("________error:", error);
            _this.is_performing_request = false;
          });
        }, 300);
      }
    },
    elk_change(key, value){
      this.elastic_filter[key] = value
      this.axio_call(this.elastic_filter)
    },
    ask_next_page(){
      console.log("new page*** ", this.current_page, this.total_pages);
      // Il faut au moins une recherche valide/
      if(this.total_pages != 0){
        this.axio_call(this.elastic_filter, has_delta=true)
      }
    }
  },
  data:{
    elastic_filter:{},
    age_group: "",
    gender: "",
    hits: 0,
    selected_colors: [],
    selected_size: [],
    selected_material: [],
    current_page: 0,
    total_pages: 1,
    taped_page: 0,
    is_performing_request: false,
    delta_page: 0,
    active: true
  },
  watch: {
      'selected_colors': function(val, oldVal){
        this.current_page = 0
        this.elk_change("generic_color", val[0])
      },
      'selected_size': function(val, oldVal){
        this.current_page = 0
        this.elk_change("taille", val[0])
      },
      'age_group':function(val, oldVal){
        this.current_page = 0
        this.elk_change("ageGroup", val)
      },
      'gender': function(val, oldVal){
        this.current_page = 0
        this.elk_change("gender", val)
      },
      'taped_page': function(val, oldVal){
        // taped_page / current_page est global
        this.current_page = val - 1
        this.elk_change("", 0)
      }
  }
});

var slider = document.getElementById('test-slider');
 noUiSlider.create(slider, {
  start: [20, 80],
  connect: true,
  step: 1,
  orientation: 'horizontal', // 'horizontal' or 'vertical'
  range: {
    'min': 0,
    'max': 100
  }
 });

 // helpers
 function offset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

console.log("done");


Vue.component('elk', {
  props: ['title'],
  template: `
    <div>
      test_ELK
    </div>
  `,computed: {
  },
  data: function () {
      return {
          suffix_url: "",
      };
  },
  methods: {
    call_curl_cmd(cmd){
      _this         = this
      axios.post('test/curl_cmd', {
        command: ""
      })
      .then(function (response) {
        console.log("response", response, "data: ", response.data);
      })
      .catch(function (error) {
        _this.m_json_return = error
        console.log("error:", error);
      });
    }
  },
})

var app = new Vue({
  el: '#app',
  delimiters: ['${', '}'],
  data:{
  },
  watch: {
    }
});

var elem = document.querySelector('select');
 var instance = M.FormSelect.init(elem);
console.log("done");

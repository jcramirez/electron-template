// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

let vueApp = new Vue({
  el: '#app',
  data: {
    message: 'Hola, Earth!',
    buttonText: 'I\'m button',
    counter: 0
  },
  methods: {
    button: function () {
      this.buttonText = `Been clicked ${++this.counter} times`
    }
  } // end of methods
})

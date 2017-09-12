// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const Serialport = require('serialport')
let ser = null
let tmpScroll = 0
let scrollDown = true

Serialport.list((err, ports) => {
  if (err) {
    return
  } else {
    vueApp.ports = ports
  }

  if (ports.length === 0) {
    vueApp.selectedPort = 'No ports discovered'
  }
})

let vueApp = new Vue({
  el: '#app',
  data: {
    isOpen: false,
    selectedPort: 'select port',
    baudrate: 38400,
    ports: [],
    message: '',
    textHeight: 200,
    portStatus: {
      msg: 'Open',
      status: false
    }
  },
  methods: {
    selectPort: function (e) {
      this.selectedPort = e.target.innerHTML
    },

    openSelectedPort: function (e) {
      if (vueApp.portStatus.status) {
        // change open button to close
        vueApp.portStatus.msg = 'Open'
        vueApp.portStatus.status = false
        closeSerial(ser)
        .then(() => {
          vueApp.updateData(`${vueApp.selectedPort} closed\n`)
          vueApp.selectedPort = 'select port'
          ser = null
          vueApp.isOpen = false
        })
        return
      }

      closeSerial(ser)
        .then(() => {
          // change open button to close
          vueApp.portStatus.msg = 'Close'
          vueApp.portStatus.status = true
          vueApp.isOpen = true

          let Serial = require('serialport')

          console.log(`port: ${vueApp.selectedPort}`)
          ser = new Serial(vueApp.selectedPort, {
            baudRate: vueApp.baudrate,
            parser: Serial.parsers.readline('\n')
          })

          ser.on('open', () => {
            vueApp.updateData(`${vueApp.selectedPort} open now!\n`)
          })

          ser.on('data', function (data) {
            // console.log(data) // debug
            vueApp.updateData(data)
          })
        })
    },

    updateData: function (data) {
      let textarea = document.getElementById('serialData')
      textarea.value += data
      // if detected scrolling up
      tmpScroll = textarea.scrollTop
      if (scrollDown) {
        textarea.scrollTop = textarea.scrollHeight
      }
    },

    clearScreen: function () {
      let textarea = document.getElementById('serialData')
      textarea.value = ''
      scrollDown = true
    }

  }
})

// rezie the textArea here so that it looks food right away
resizeTextarea()

/**
 * [closeSerial description]
 * @param  {[type]} port [description]
 * @return {[type]}      [description]
 */
const closeSerial = (port) => {
  return new Promise((resolve, reject) => {
    if (port === null) {
      resolve()
    } else {
      port.close((err) => {
        if (err) {
          console.log(`\nserial error: ${err}`)
        }
        console.log(`\nserial port closed`)
        resolve()
      })
    }
  })
}

jQuery(($) => {
  $('#serialData').scroll(function () {
    // console.log(`scrolTop: ${$(this).scrollTop()} and tmp: ${tmpScroll}`)
    if ($(this).scrollTop() < tmpScroll) {
      // console.log('going up')
      scrollDown = false
    } else {
      // console.log('going down')
      // detect when scrolled all the way to the bottom
      if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
        // alert("You scrolled to the bottom!")
        scrollDown = true
        // console.log('scroll bottom')
      }
    }
    tmpScroll = $(this).scrollTop()
  })
})

/**
 *
 */
window.addEventListener('resize', function (e) {
  e.preventDefault()
  resizeTextarea()
})

/**
 *
 */
function resizeTextarea () {
  const {BrowserWindow} = require('electron').remote
  let currentWin = BrowserWindow.getFocusedWindow()
  let size = currentWin.getSize()
  vueApp.textHeight = size[1] - 200
  // console.log(`size: ${vueApp.textHeight}`)
}

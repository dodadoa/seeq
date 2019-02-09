function Sequencer(){

  this.currentIndex = 0
  this.target

  this.paragraphCursorPosition = 0
  this.textBuffers = ""
  this.output = ""
  this.isCursorActived = false
  this.timer = ""

  this.clock =  100

  this.refresh = function(){
    this.textBuffers = seeq.fetchDataSection.text.innerText; 
  }

  this.set = function(){
		this.output =  this.textBuffers.substr(0, this.paragraphCursorPosition) +
		"<span class=\"current-active\">" +
		this.textBuffers.substr(this.paragraphCursorPosition, 1) +
		"</span>" +
    this.textBuffers.substr(this.paragraphCursorPosition+1)  ;

    seeq.fetchDataSection.updateWithCursor(this.output)
    this.isCursorActived = true
    this.setCounterDisplay()
  }

  // connect with Ableton Link.
  this.connect = function(data){
    const { beat, bpm } = data
    var CLOCK_DIVIDER = 8
    var MS_PER_BEAT = 1000 * 60 / bpm
    var CONVERTED_BPM = MS_PER_BEAT / CLOCK_DIVIDER
    if( beat % CLOCK_DIVIDER == 0){
      this.clock = CONVERTED_BPM
    }
  }

  this.setCounterDisplay = function(){
    seeq.currentNumber.innerHTML = this.paragraphCursorPosition
  }

  this.setTotalLenghtCounterDisplay = function(){
    seeq.totalNumber.innerHTML = seeq.fetchDataSection.text.innerText.length
  }

  this.selectedTextArea = function(){
    seeq.seq.paragraphCursorPosition = seeq.matchedSelectPosition
  }

  this.setSelectLoopRange = function(){
    // limited sequence within select range.
    if( seeq.isSelectDrag){
      if( seeq.seq.paragraphCursorPosition > seeq.selectAreaLength - 2){
        return seeq.seq.paragraphCursorPosition = seeq.matchedSelectPosition
      } else if (seeq.isReverse && seeq.seq.paragraphCursorPosition < seeq.matchedSelectPosition){
        return seeq.seq.paragraphCursorPosition = seeq.selectAreaLength - 2
      }
    } 
  }

  this.increment = function(){
    var length = seeq.fetchDataSection.text.innerText.length

    // boundary.
    if( this.paragraphCursorPosition > length-1){
      this.paragraphCursorPosition = 0
      seeq.seq.refresh()
      seeq.seq.set() 
    } else if ( seeq.isReverse && this.paragraphCursorPosition <= 0){
      this.paragraphCursorPosition = length - 1
      seeq.seq.refresh()
      seeq.seq.set() 
    }

    // increment | decrement.
    this.selectDom
    seeq.isReverse ? this.paragraphCursorPosition -= 1 : this.paragraphCursorPosition += 1
    this.setSelectLoopRange()
    seeq.seq.run()
    this.trigger()
  }

  this.trigger = function(){
    if( seeq.searchValue !== ""){
      if(seeq.matchedPosition.indexOf(this.paragraphCursorPosition) !== (-1) && seeq.matchedPosition){
        seeq.appWrapper.classList.add("trigger")
        seeq.sendOsc()
      }
      setTimeout(() => {
        seeq.appWrapper.classList.remove("trigger")
      }, 50);
    }
  }

  this.run = function(){
    this.timer = setTimeout( function(){
        // this.paragraphCursorPosition  += 1  //remove this when wanted to run auto.
        seeq.seq.refresh()
        seeq.seq.set()
        seeq.seq.increment() //enable this when wanted to run auto.
    }, seeq.seq.clock)
  }

  this.stop = function(){
    clearTimeout(this.timer)
    this.paragraphCursorPosition = 0
    seeq.seq.refresh()
    seeq.seq.set()
  }
  
}


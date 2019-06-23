'use strict'

function Cursor(terminal) {
  this.x = 0
  this.y = 0
  this.w = 1
  this.h = 1
  this.mode = 0
  this.block = []

  this.move = function (x, y) {
    if (isNaN(x) || isNaN(y)) { return }
    this.x = clamp(this.x + parseInt(x), 0, terminal.seequencer.w - 1)
    this.y = clamp(this.y - parseInt(y), 0, terminal.seequencer.h - 1)
    terminal.update()
  }

  this.scale = function (x, y) {
    if (isNaN(x) || isNaN(y)) { return }
    this.w = clamp(this.w + parseInt(x), 1, terminal.seequencer.w - this.x)
    this.h = clamp(this.h - parseInt(y), 1, terminal.seequencer.h - this.y)
    terminal.update()
  }

  this.overlapChecker = function(){
    const block = this.getBlock()
  }

  /* #region fold */
  // this.moveTo = function (x, y) {
  //   if (isNaN(x) || isNaN(y)) { return }
  //   this.x = clamp(parseInt(x), 0, terminal.seequencer.w - 1)
  //   this.y = clamp(parseInt(y), 0, terminal.seequencer.h - 1)
  //   terminal.update()
  // }

  // this.scaleTo = function (w, h) {
  //   if (isNaN(w) || isNaN(h)) { return }
  //   this.w = clamp(parseInt(w), 1, terminal.seequencer.w - 1)
  //   this.h = clamp(parseInt(h), 1, terminal.seequencer.h - 1)
  //   terminal.update()
  // }

  // this.resize = function (w, h) {
  //   if (isNaN(w) || isNaN(h)) { return }
  //   this.w = clamp(parseInt(w), 1, terminal.seequencer.w - this.x)
  //   this.h = clamp(parseInt(h), 1, terminal.seequencer.h - this.y)
  //   terminal.update()
  // }

  // this.drag = function (x, y) {
  //   if (isNaN(x) || isNaN(y)) { return }
  //   this.mode = 0
  //   this.cut()
  //   this.move(x, y)
  //   this.paste()
  // }

  // this.selectAll = function () {
  //   this.x = 0
  //   this.y = 0
  //   this.w = terminal.seequencer.w
  //   this.h = terminal.seequencer.h
  //   this.mode = 0
  //   terminal.update()
  // }

  // this.copy = function () {
  //   const block = this.getBlock()
  //   var rows = []
  //   for (var i = 0; i < block.length; i++) {
  //     rows.push(block[i].join(''))
  //   }
  //   clipboard.writeText(rows.join('\n'))
  // }

  // this.cut = function () {
  //   this.copy()
  //   this.erase()
  // }

  // this.paste = function (overlap = false) {
  //   this.writeBlock(clipboard.readText().split(/\r?\n/), overlap)
  // }

  // this.rotate = function (rate = 1) {
  //   if (isNaN(rate)) { return }
  //   const cols = terminal.cursor.getBlock()
  //   for (const y in cols) {
  //     for (const x in cols[y]) {
  //       const g = cols[y][x]
  //       if (g === '.') { continue }
  //       if (terminal.seequencer.isSpecial(g)) { continue }
  //       cols[y][x] = terminal.seequencer.keyOf(parseInt(rate) + terminal.seequencer.valueOf(g), sense(g))
  //     }
  //   }
  //   terminal.cursor.writeBlock(cols)
  // }

  // this.comment = function () {
  //   const block = this.getBlock()
  //   for (const id in block) {
  //     block[id][0] = block[id][0] === '#' ? '.' : '#'
  //     block[id][block[id].length - 1] = block[id][block[id].length - 1] === '#' ? '.' : '#'
  //   }
  //   this.writeBlock(block)
  // }

  /* #endregion*/

  this.select = function (x = this.x, y = this.y, w = this.w, h = this.h) {
    this.moveTo(x, y)
    this.scaleTo(w, h)
    terminal.update()
  }

  this.reset = function (pos = false) {
    if (pos) {
      this.x = 0
      this.y = 0
    }
    this.move(0, 0)
    this.w = 1
    this.h = 1
    this.mode = 0
  }

  this.read = function () {
    return terminal.seequencer.glyphAt(this.x, this.y)
  }

  this.write = function (g) {
    if (terminal.seequencer.write(this.x, this.y, g) && this.mode === 1) {
      this.move(1, 0)
    }
    // terminal.history.record(terminal.seequencer.s)
  }

  this.erase = function () {
    this.eraseBlock(this.x, this.y, this.w, this.h)
    if (this.mode === 1) { this.move(-1, 0) }
    terminal.history.record(terminal.seequencer.s)
  }

  this.find = function (str) {
    const i = terminal.seequencer.s.indexOf(str)
    if (i < 0) { return }
    const pos = terminal.seequencer.posAt(i)
    this.w = str.length
    this.h = 1
    this.x = pos.x
    this.y = pos.y
  }

  this.trigger = function () {
    const operator = terminal.seequencer.operatorAt(this.x, this.y)
    if (!operator) { console.warn('Cursor', 'Nothing to trigger.'); return }
    console.log('Cursor', 'Trigger: ' + operator.name)
    operator.run(true)
  }

  this.toggleMode = function (val) {
    this.w = 1
    this.h = 1
    this.mode = this.mode === 0 ? val : 0
  }

  this.inspect = function (name = true, ports = false) {
    // if (this.w > 1 || this.h > 1) { return 'multi' }
    // const port = terminal.portAt(this.x, this.y)
    // if (port) { return `${port[3]}` }
    // if (terminal.seequencer.lockAt(this.x, this.y)) { return 'locked' }
    return 'empty'
  }

  /* #region fold */
  // Block

  this.getBlock = function () {
    const rect = this.toRect()
    const block = []
    for (let _y = rect.y; _y < rect.y + rect.h; _y++) {
      const line = []
      for (let _x = rect.x; _x < rect.x + rect.w; _x++) {
        block.push({x: _x, y: _y })
      }
      // block.push(line)
    }
    return block
  }

  // this.writeBlock = function (block, overlap = false) {
  //   if (!block || block.length === 0) { return }
  //   const rect = this.toRect()
  //   let _y = rect.y
  //   for (const x in block) {
  //     let _x = rect.x
  //     for (const y in block[x]) {
  //       const glyph = block[x][y]
  //       terminal.seequencer.write(_x, _y, overlap === true && glyph === '.' ? terminal.seequencer.glyphAt(_x, _y) : glyph)
  //       _x++
  //     }
  //     _y++
  //   }
  //   terminal.history.record(terminal.seequencer.s)
  // }

  // this.eraseBlock = function (x, y, w, h) {
  //   if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) { return }
  //   for (let _y = y; _y < y + h; _y++) {
  //     for (let _x = x; _x < x + w; _x++) {
  //       terminal.seequencer.write(_x, _y, '.')
  //     }
  //   }
  //   terminal.history.record(terminal.seequencer.s)
  // }

  /* #endregion*/

  this.toRect = function () {
    return { x: this.x, y: this.y, w: this.w, h: this.h }
  }

  function sense (s) { return s === s.toUpperCase() && s.toLowerCase() !== s.toUpperCase() }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Cursor
const { get, set } = require('lodash')

const LT = -1
const EQ = 0
const GT = 1

const RAM_SIZE = 256

function buildMemory() {
  const memory = []
  for (let i = 0; i < RAM_SIZE; i++) {
    memory.push(0)
  }

  return memory
}

function initialState(labels = {}) {
  return {
    labels,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    PC: 0,
    CMP: EQ,
    STACK: [],
    RAM: buildMemory()
  }
}

function maybeConvert(input) {
  return isNaN(input) ? input : parseInt(input)
}

function splitInstruction(line) {
  const index = line.indexOf(' ')
  if (index === -1) {
    return [line, '']
  }

  return [line.substring(0, index), line.substring(index + 1)]
}

function parseInstruction(line) {
  // MOV A, B -> ['MOV', 'A', 'B']
  const [instruction, paramsStr] = splitInstruction(line)
  const params = paramsStr
    .split(',')
    .map(p => p.trim())
    .map(maybeConvert)

  return [instruction.toLowerCase(), ...params]
}

function parseInstructions(program) {
  const lines = program
    .split('\n')
    .map(l => l.trim())
    .filter(l => l !== '' && l[0] !== '#')

  const instructions = []
  const labels = {}

  let index = 0
  for (const line of lines) {
    if (line.endsWith(':')) {
      labels[line.substr(0, line.length - 1)] = index
    } else {
      instructions.push(parseInstruction(line))
      index++
    }
  }

  return { instructions, labels }
}

function load(state, expr) {
  if (typeof expr === 'number') {
    return expr
  }

  if (expr[0] === '*') {
    return state.RAM[load(state, expr.substr(1))]
  }

  return get(state, expr)
}

function store(state, dst, value) {
  if (dst[0] === '*') {
    state.RAM[load(state, dst.substr(1))] = value
    return
  }

  set(state, dst, value)
}

const instructionHandlers = {
  mov(state, [dst, src]) {
    store(state, dst, load(state, src))
  },
  add(state, [dst, src]) {
    store(state, dst, load(state, dst) + load(state, src))
  },
  sub(state, [dst, src]) {
    store(state, dst, load(state, dst) - load(state, src))
  },
  mul(state, [dst, src]) {
    store(state, dst, load(state, dst) * load(state, src))
  },
  inc(state, [dst]) {
    store(state, dst, load(state, dst) + 1)
  },
  dec(state, [dst]) {
    store(state, dst, load(state, dst) - 1)
  },
  print(state, [value]) {
    console.log(load(state, value))
  },
  printexpr(state, [expr]) {
    console.log(expr)
  },
  push(state, [value]) {
    state.STACK.push(load(state, value))
  },
  pop(state, [dst]) {
    const top = state.STACK.pop()
    if (typeof dst !== 'undefined') {
      store(state, dst, top)
    }
  },
  call(state, [label]) {
    state.STACK.push(state.PC)
    this.jmp(state, [label])
  },
  ret(state) {
    this.pop(state, ['PC'])
  },
  cmp(state, [left, right]) {
    const leftValue = load(state, left)
    const rightValue = load(state, right)
    if (leftValue > rightValue) {
      state.CMP = GT
    } else if (leftValue < rightValue) {
      state.CMP = LT
    } else {
      state.CMP = EQ
    }
  },
  jle(state, [label]) {
    if (state.CMP === LT || state.CMP === EQ) {
      state.PC = state.labels[label] - 1
    }
  },
  jl(state, [label]) {
    if (state.CMP === LT) {
      state.PC = state.labels[label] - 1
    }
  },
  jge(state, [label]) {
    if (state.CMP === GT || state.CMP === EQ) {
      state.PC = state.labels[label] - 1
    }
  },
  jg(state, [label]) {
    if (state.CMP === GT) {
      state.PC = state.labels[label] - 1
    }
  },
  jeq(state, [label]) {
    if (state.CMP === EQ) {
      state.PC = state.labels[label] - 1
    }
  },
  jmp(state, [label]) {
    state.PC = state.labels[label] - 1
  }
}

function execute(state, instruction) {
  const [instructionName, ...params] = instruction
  instructionHandlers[instructionName](state, params)
}

function runProgram(input) {
  const { instructions, labels } = parseInstructions(input)
  const state = initialState(labels)
  while (state.PC < instructions.length) {
    execute(state, instructions[state.PC])
    state.PC++
  }
}

process.stdin.resume();
process.stdin.setEncoding("ascii");
_input = "";
process.stdin.on("data", function (input) {
  _input += input;
});
process.stdin.on("end", function () {
  runProgram(_input);
});

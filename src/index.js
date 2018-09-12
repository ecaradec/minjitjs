var NOP = 0x00;
var JMP = 0x01;
var ADD = 0x02;
var JNZ = 0x03;
var LD  = 0x04;
var CMP = 0x05;

var debug = true;

function JITCompiler(memory) {
    this.memory = memory;
}
JITCompiler.prototype.compile=function(ip) {
    this.jitIP = ip;
    var fName = "f_"+this.jitIP;
    console.log("Building "+fName+"...");
    
    var body = "";
    var j = 0;
    do {
        var opcode = this.fetch();
        body += this.ops[opcode](this);
        if(opcode == JMP || opcode == JNZ)
            break;
    } while(true);

    console.log(body);
    var f =  new Function('m', body);
    return f;
}
JITCompiler.prototype.fetch=function() {
    var b = this.memory[this.jitIP];
    this.jitIP++;
    return b;
}
var ops = JITCompiler.prototype.ops = [];
ops[NOP] = function(c) {
    return `
    ${debug?'m.log("NOP");':''}
    m.registers.IP+1;
`;
}
ops[ADD] = function(c) {
    var operand = c.fetch();
    return `
    ${debug?'m.log("ADD '+operand+'");':''}
    m.registers.A += ${operand};
    m.registers.IP+=2;
    `;
}
ops[CMP] = function(c) {
    var operand = c.fetch();
    return `
    ${debug?'m.log("CMP '+operand+'");':''}
    m.registers.IP+=2;
    m.registers.Z=(m.registers.A==${operand});
    `;
}
ops[LD] = function(c) {
    var operand = c.fetch();
    return `
    ${debug?'m.log("LD '+operand+'");':''}    
    m.registers.IP+=2;
    m.registers.A=${operand};
    `;
}
ops[JMP] = function(c) {
    var operand = c.fetch();
    return `
    ${debug?'m.log("JMP '+operand+'");':''}    
    m.registers.IP=${operand};
    `;
}
ops[JNZ] = function(c) {
    var operand = c.fetch();
    return `
    ${debug?'m.log("JNZ '+operand+'");':''}    
    if(!m.registers.Z)
        m.registers.IP=${operand};
    else
        m.registers.IP+=2;
    `;
}

function VM() {
    this.funcs = {};
    this.memory = [ADD, 1, CMP, 16, JNZ, 0, LD, 0, JMP, 0];
    this.compiler = new JITCompiler(this.memory);
}
VM.prototype.reset=function() {
    this.registers = { IP:0, A: 0, Z: 0};
    
    //for(;;) {
    for(var it=0;it<50;it++) {
        var f =  this.funcs['f_'+this.registers.IP]!=undefined ? this.funcs['f_'+this.registers.IP] : (this.funcs['f_'+this.registers.IP] = this.compiler.compile(this.registers.IP) );
        f(this);
    }
}
VM.prototype.log = function(opcode) {
    console.log(this.registers.IP+" "+opcode+"   \t: A="+this.registers.A+" Z="+(this.registers.Z?1:0));
}

var vm = new VM;
vm.reset();


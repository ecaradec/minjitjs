var NOP = 0x00;
var JMP = 0x01;
var ADD = 0x02;
var JNZ = 0x03;
var LD  = 0x04;
var CMP = 0x05;

var memory = [ADD, 1, CMP, 16, JNZ, 0, LD, 0, JMP, 0];

function log(opcode) {
    console.log(registers.IP+" "+opcode+"   \t: A="+registers.A+" Z="+(registers.Z?1:0));
}

var jitIP = 0;
var registers = {IP : 0, A:0, log: log};
var funcs = [];
var debug = true;

function compile(jitIP) {    
    var fName = "f_"+jitIP;
    console.log("Building "+fName+"...");
    
    var body = "";
    var j = 0;
    do {
        var opcode = memory[jitIP];
        jitIP+=1;

        if(opcode == NOP) {
            if(debug) body += "m.log('NOP')\n";
            body += "m.IP+=1;\n"; // it's sort of useless to update IP
        }
        if(opcode == ADD) {
            if(debug) body += "m.log('ADD "+memory[jitIP]+"')\n";
            body += "m.IP+=2;\n"
            body += "m.A+="+memory[jitIP]+";\n";
            jitIP++;
        }
        if(opcode == CMP) {
            if(debug) body += "m.log('CMP "+memory[jitIP]+"')\n"; 
            body += "m.IP+=2;\n"
            body += "m.Z=(m.A=="+memory[jitIP]+");\n";
            jitIP++;
        }
        if(opcode == LD) {
            if(debug) body += "m.log('LD "+memory[jitIP]+"')\n";             
            body += "m.IP+=2;\n"
            body += "m.A="+memory[jitIP]+";\n";
            jitIP++;
        }        
        if(opcode == JMP) {
            if(debug) body += "m.log('JMP "+memory[jitIP]+"')\n";             
            body += "m.IP="+memory[jitIP]+";\n"
            break;
        }
        if(opcode == JNZ) {
            if(debug) body += "m.log('JNZ "+memory[jitIP]+"')\n";            
            body += "if(!m.Z)\n";
            body += "    m.IP="+memory[jitIP]+";\n"
            body += "else";
            body += "    m.IP+=2;";
            break;
        }        
    } while(true);

    console.log(body);
    var f = funcs[fName] = new Function('m', body);
    return f;
}

for(var it=0;it<50;it++) {
    var f = funcs['f_'+registers.IP]!=undefined ? funcs['f_'+registers.IP] : compile(registers.IP);
    f(registers);
}


MOV A, SAY_HELLO
MOV RAM[1], 15
MOV RAM[15], 30
MOV RAM[30], 125

MOV **RAM[1], 250
PRINT RAM[30]
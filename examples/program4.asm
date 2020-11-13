CALL fill_zeros
PRINT RAM
JMP end

# Te mbushet krejt rami me 1sha

fill_zeros:
MOV A, 0
MOV B, 1
loop:
MOV *A, B
INC A
INC B
CMP A, 256
JL loop
RET

end:
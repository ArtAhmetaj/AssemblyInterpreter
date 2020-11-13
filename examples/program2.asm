MOV A, 1
loop:
PRINT A
INC A
CMP A, 10
JLE loop
JMP end
PRINT 999
end:

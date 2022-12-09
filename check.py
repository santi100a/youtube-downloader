from os import system

code: int = system(input('Enter a command: '))
if code == 0:
    print( '[process exited with stopcode\x1b[1;32m 0\x1b[0m]')
else:
    print(f'[process exited with stopcode\x1b[1;31m {code}\x1b[0m]')
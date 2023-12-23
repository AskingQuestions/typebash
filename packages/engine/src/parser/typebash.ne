# Match a CSS color
# http://www.w3.org/TR/css3-color/#colorunits
@builtin "whitespace.ne" # `_` means arbitrary amount of whitespace
@builtin "number.ne"     # `int`, `decimal`, and `percentage` number primitives
typebash -> 

command -> [a-zA-Z0-9_\-.\/]+
argument -> [a-zA-Z0-9_\-.\/]+ | 
expression -> "{" [^}]* "}"

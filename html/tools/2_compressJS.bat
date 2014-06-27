cd "..\"

"tools/java.exe" -jar "tools/compiler.jar" --js "js/all.annotated.js" --js_output_file "js/all.min.js" --compilation_level SIMPLE_OPTIMIZATIONS

cd "js\"

del "all.prepare.js"

del "all.annotated.js"

cd "..\"

"tools/java.exe" -jar "tools/consyntools.jar" Obfuscator "js/all.min.js" "js/all.js"

cd "js\"

#del "all.min.js"





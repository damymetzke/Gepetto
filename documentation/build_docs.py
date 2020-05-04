import markdown
import inspect
import os
import re
import shutil
import sys
import subprocess


class OutputBufferObject:
    data = ""

    def write(self, text):
        self.data = self.data + text.decode("utf-8")


basePath: str = os.path.dirname(
    os.path.abspath(inspect.getfile(inspect.currentframe())))

jsDocPath = r'.\node_modules\.bin\jsdoc'
jsDocConfigPath = r'.\jsdoc.config.js'

filePathTest = re.compile(r'^((doc))\\.+\.md')
mdFileReplace = re.compile(r'\.md$')

for root, dirs, files in os.walk(os.path.join(basePath, "build"), topdown=False):
    for file in files:
        os.remove(os.path.join(root, file))
    for dir in dirs:
        os.rmdir(os.path.join(root, dir))


def BuildFile(filePath: str):
    outputPath = re.sub(r'\.md$', ".html", os.path.join(
        basePath, "build", filePath))
    os.makedirs(os.path.dirname(os.path.join(
        basePath, "build", filePath)), exist_ok=True)

    old_stdout = sys.stdout
    outputBuffer = OutputBufferObject()
    sys.stdout = outputBuffer

    markdown.markdownFromFile(
        input=os.path.join(basePath, filePath),
        extensions=['fenced_code']
    )

    sys.stdout = old_stdout

    outputResult = '<html lang="en"><head></head><body>{0}</body></html>'.format(
        outputBuffer.data).replace("\\n", "")

    outFile = open(outputPath, "w")
    outFile.write(outputResult)
    outFile.close()


# build markdown files
for root, dirs, files in os.walk(basePath):
    relativePath = os.path.relpath(root, basePath)
    for file in files:
        if filePathTest.match(os.path.join(relativePath, file)):
            BuildFile(os.path.join(relativePath, file))

# build jsdoc
command = '"{0}" -c "{1}"'.format(jsDocPath, jsDocConfigPath)
print(command)
os.chdir(os.path.join(basePath, ".."))
subprocess.call(command, shell=True)

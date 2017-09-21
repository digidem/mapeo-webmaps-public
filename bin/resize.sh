#!/bin/bash

mkdir -p static/assets/m/
mkdir -p static/assets/s/

cp images/*.jpg static/assets/m/
cp images/*.jpg static/assets/s/

sips --resampleWidth 400 static/assets/s/*.jpg > /dev/null 2>&1
sips --resampleWidth 1200 static/assets/m/*.jpg > /dev/null 2>&1

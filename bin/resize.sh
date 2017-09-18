#!/bin/bash

cp images/*.jpg static/images/m/
cp images/*.jpg static/images/s/

sips -Z 400 static/images/s/*.jpg
sips -Z 1200 static/images/m/*.jpg

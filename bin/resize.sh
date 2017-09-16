#!/bin/bash

cp static/images/o/*.jpg static/images/m/
cp static/images/o/*.jpg static/images/s/

sips -Z 400 static/images/s/*.jpg
sips -Z 1200 static/images/m/*.jpg

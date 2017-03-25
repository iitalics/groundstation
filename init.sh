#!/bin/sh

py=python3
pip=pip

proj=proj
pip_deps="flask"


if [ ! -d $proj ]; then
    echo "creating virtual env"
    mkdir $proj && \
        $py -m venv $proj && \
        source $proj/bin/activate && \
        $pip install $pip_deps
else
        source $proj/bin/activate
fi

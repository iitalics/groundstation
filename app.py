#!/usr/bin/python3
import flask

app = flask.Flask(__name__)

@app.route("/")
def root():
    return flask.render_template("index.html")

if __name__ == "__main__":
    app.run(threaded=True)

# streamlit-input-box

Streamlit component that allows you to edit text/code in a convenient auto-resizable text area.
Intended both for code and natural language input (no syntax highlighting implemented).
No text wrap and horizontal scrolling makes code editing easier.
It's state resets to empty automatically after submiting.
Manages its own history of inputs that can be navigated using Ctrl+up / Ctrl+down.
Colors adapt dynamically to the app's theme.

## Installation instructions

```sh
pip install streamlit-input-box
```

## Usage instructions

Pretty straighforward.

```python
text=input_box(
    min_lines=1,
    max_lines=5,
    just_once=False,
    callback=None,
    args=(),
    kwargs={},
    key=None
)
```
Renders an auto-resizable text area. 
Enter and Tab keystrokes behave as expected for text edition.
Ctrl+Enter or click the 'send' button to submit.
Returns the inputted text.

Arguments:
- min/max_lines: minimal and maximal limits for auto-resizing of the input box.
- just_once: determines if the component will return the text only once after submiting (and then None), or on every rerun of the app.
- callback: optional callback passed to the component that will be called after submitting.
- args: optional tuple of arguments passed to the callback
- kwargs: optional dict of named arguments passed to the callback
- key: unique state identifier for your component 

## Example

```python
import streamlit as st
from streamlit_input_box import input_box

state=st.session_state

if 'texts' not in state:
    state.texts=[]

text=input_box(min_lines=3,max_lines=10,just_once=True)
    
if text:
    state.texts.append(text)

for text in state.texts:
    st.text(text)
```
import os
import streamlit.components.v1 as components
import streamlit as st

_RELEASE = True

if not _RELEASE:
    _component_func = components.declare_component("streamlit_input_box",url="http://localhost:3001")
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func = components.declare_component("streamlit_input_box", path=build_dir)

def input_box(min_lines=1, max_lines=5,just_once=False,callback=None,args=(),kwargs={},key=None):
    if not '_last_input_box_id' in st.session_state:
        st.session_state._last_input_box_id=0
    if key and not key+'_output' in st.session_state:
        st.session_state[key+'_output']=None
    new_output=False
    component_value = _component_func(min_lines=min_lines,max_lines=max_lines,key=key,default=None)
    if not component_value:
        output=None
    else:
        id=component_value['id']
        text=component_value['text']
        new_output=(id>st.session_state._last_input_box_id)
        if new_output or not just_once:
            st.session_state._last_input_box_id=id
            output=text
        else:
            output=None
    if key:
        st.session_state[key+'_output']=output
    if new_output and callback:
        callback(*args,**kwargs)
    return output

if not _RELEASE:
    import streamlit as st

    state=st.session_state

    if 'texts' not in state:
        state.texts=[]

    def callback():
        st.write("success!")

    text=input_box(min_lines=3,max_lines=10,just_once=True,callback=callback,key='inputbox')
      
    if text:
        state.texts.append(text)

    for text in state.texts:
        st.text(text)


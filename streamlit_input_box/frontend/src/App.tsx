import React, { ReactNode } from "react";
import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib";
import 'font-awesome/css/font-awesome.min.css';
import './App.css';
import tinycolor from 'tinycolor2'

interface State {
  value: string;
  hasFocus:boolean;
  commandHistory: string[];
  currentCommandIndex: number;
  lastCommand: string
}

const HEIGHT_PER_LINE = 21;


class InputBox extends StreamlitComponentBase<State> {

  constructor(props: any) {
    super(props);
    this.state = {
      value: "",
      hasFocus:false,
      commandHistory: [] as string[],
      currentCommandIndex: -1,
      lastCommand:""
    };
  }

  private getNumberOfLines = (text: string): number => {
    return text.split('\n').length;
  }

  private handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ value: e.target.value });
    if (this.state.currentCommandIndex === -1) {
      this.setState({
        lastCommand: e.target.value
      });
    }
  };


  
  private handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
  
      const tabCharacter = '    '; // 4 spaces, or use '\t' for a tab character
  
      if (e.shiftKey) {
        // Handle untabbing (Shift + Tab)
        if (start === end) {
          // No text selected, remove tab character before cursor if present
          const beforeCursor = value.substring(0, start);
          if (beforeCursor.endsWith(tabCharacter)) {
            const newCursorPos = start - tabCharacter.length;
            this.setState({
              value: beforeCursor.substring(0, newCursorPos) + value.substring(end),
            }, () => {
              target.selectionStart = target.selectionEnd = newCursorPos;
            });
          }
        } else {
          // Text selected, un-indent all selected lines
          const beforeSelection = value.substring(0, start);
          const selectedText = value.substring(start, end);
          const afterSelection = value.substring(end);
  
          const lines = selectedText.split("\n");
          const unindentedLines = lines.map(line => line.startsWith(tabCharacter) ? line.substring(tabCharacter.length) : line);
          const unindentedText = unindentedLines.join("\n");
  
          // Adjust the new end position to maintain selection
          const newEnd = start + unindentedText.length;
  
          this.setState({
            value: beforeSelection + unindentedText + afterSelection,
          }, () => {
            target.selectionStart = start;
            target.selectionEnd = newEnd;
          });
        }
      } else {
        // Handle normal tabbing
        if (start === end) {
          // No text selected, insert tab character at cursor
          this.setState({
            value: value.substring(0, start) + tabCharacter + value.substring(end),
          }, () => {
            target.selectionStart = target.selectionEnd = start + tabCharacter.length;
          });
        } else {
          // Text selected, indent all selected lines
          const beforeSelection = value.substring(0, start);
          const selectedText = value.substring(start, end);
          const afterSelection = value.substring(end);
  
          const lines = selectedText.split("\n");
          const indentedText = lines.map(line => tabCharacter + line).join("\n");
  
          // Adjust the new end position to maintain selection
          const newEnd = start + indentedText.length;
  
          this.setState({
            value: beforeSelection + indentedText + afterSelection,
          }, () => {
            target.selectionStart = start;
            target.selectionEnd = newEnd;
          });
        }
      }
    }  
    else if (e.key === 'Enter' && e.ctrlKey) {
      this.sendToStreamlit();
    } 
    else if (e.ctrlKey && e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.state.currentCommandIndex < this.state.commandHistory.length - 1) {
        this.setState(prevState => ({
          currentCommandIndex: prevState.currentCommandIndex + 1,
          value: prevState.commandHistory[prevState.commandHistory.length - prevState.currentCommandIndex - 2] || ''
        }));
      }
    } 
    else if (e.ctrlKey && e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.state.currentCommandIndex > -1) {
        this.setState(prevState => ({
          currentCommandIndex: prevState.currentCommandIndex - 1,
          value: prevState.currentCommandIndex === 0 ? prevState.lastCommand : prevState.commandHistory[prevState.commandHistory.length - prevState.currentCommandIndex]
        }));
      }
    }
  };

  private sendToStreamlit = () => {
    // Create the payload with the text and a microsecond float timestamp as the ID
    const payload = {
      text: this.state.value,
      id: Date.now()
    };
    Streamlit.setComponentValue(payload);
    this.setState(prevState => ({
      value: "",
      commandHistory: [...prevState.commandHistory, prevState.value],
      currentCommandIndex: -1,
      lastCommand: ""
    }));
  };

  private TextAreaStyle = (Theme:any):any => {
    const baseBorderColor = tinycolor.mix(Theme.textColor, Theme.backgroundColor, 80).lighten(2).toString();
    const backgroundColor = tinycolor.mix(Theme.textColor, tinycolor.mix(Theme.primaryColor, Theme.backgroundColor, 99), 99).lighten(0.5).toString();
    const textColor = Theme.textColor;
    const borderColor = this.state.hasFocus ? Theme.primaryColor : baseBorderColor
    const numberOfLines = Math.max(this.getNumberOfLines(this.state.value), this.props.args.min_lines);
    const padding=16;
    
    return {
        height: `${Math.min(numberOfLines * HEIGHT_PER_LINE, HEIGHT_PER_LINE * this.props.args.max_lines)+2*padding}px`,
        borderColor: borderColor,
        backgroundColor: backgroundColor,
        color: textColor,
        whiteSpace: 'pre',
        overflowX: 'auto',
        resize:"none",
        width: 'calc(100% - 6px)',
        margin: '3px',
        outline: 'none',
        fontFamily: "monospace",
        padding:`${padding}px 6px`
    };
  }

  private ButtonStyle = (Theme:any):any => {
    const baseBorderColor = tinycolor.mix(Theme.textColor, Theme.backgroundColor, 80).lighten(2).toString();
    const borderColor = this.state.hasFocus ? Theme.primaryColor : baseBorderColor
    
    return {
        position: 'absolute',
        bottom: '10px', 
        right: '10px', 
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: borderColor,
        fontSize: '1.2em'
    };
  }

  public render = (): ReactNode => {
    const Theme = this.props.theme ?? {
      base: 'dark',
      backgroundColor: 'black',
      secondaryBackgroundColor: 'grey',
      primaryColor: 'red',
      textColor: 'white'
    };
    return (
        <div className="mycomponent">
            <textarea
                className="mytextarea"
                autoFocus
                value={this.state.value}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
                style={this.TextAreaStyle(Theme)}
                onFocus={() => this.setState({ hasFocus: true })}
                onBlur={() => this.setState({ hasFocus: false })}
            />
            <button
                onClick={this.sendToStreamlit}
                style={this.ButtonStyle(Theme)}
            >
                <i className="fa fa-paper-plane"></i>
            </button>
        </div>
    );
  };
}

export default withStreamlitConnection(InputBox);

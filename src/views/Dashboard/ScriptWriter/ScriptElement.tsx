const scriptElements = [
  {
    type: 'scene',
    label: 'Scene Heading',
    icon: 'bx-movie',
    template: 'INT. LOCATION - DAY',
    style: {
      textTransform: 'uppercase',
      fontWeight: 'bold',
      marginBottom: '1em'
    }
  },
  {
    type: 'action',
    label: 'Action',
    icon: 'bx-run',
    template: 'Character performs an action...',
    style: {
      marginBottom: '1em'
    }
  },
  {
    type: 'character',
    label: 'Character',
    icon: 'bx-user',
    template: 'CHARACTER NAME',
    style: {
      textTransform: 'uppercase',
      textAlign: 'center',
      marginBottom: '0.5em',
      marginTop: '1em'
    }
  },
  {
    type: 'dialogue',
    label: 'Dialogue',
    icon: 'bx-message-square',
    template: 'Character dialogue goes here...',
    style: {
      textAlign: 'center',
      marginLeft: '20%',
      marginRight: '20%',
      marginBottom: '1em'
    }
  },
  {
    type: 'parenthetical',
    label: 'Parenthetical',
    icon: 'bx-parentheses',
    template: '(emotional state)',
    style: {
      textAlign: 'center',
      marginLeft: '30%',
      marginRight: '30%',
      marginBottom: '0.5em'
    }
  },
  {
    type: 'transition',
    label: 'Transition',
    icon: 'bx-transfer',
    template: 'CUT TO:',
    style: {
      textAlign: 'right',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      marginTop: '1em',
      marginBottom: '1em'
    }
  }
]

export default scriptElements

export interface InteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

export interface InteractiveListSectionRow {
  id: string;
  title: string;
  description?: string;
}

export interface InteractiveListSection {
  title: string;
  rows: InteractiveListSectionRow[];
}

export interface InteractiveBody {
  text: string;
}

export interface InteractiveButtonAction {
  buttons: InteractiveButton[];
}

export interface InteractiveListAction {
  button: string;
  sections: InteractiveListSection[];
}

export interface InteractiveMessage {
  type: 'button' | 'list';
  body: InteractiveBody;
  action: InteractiveButtonAction | InteractiveListAction;
}

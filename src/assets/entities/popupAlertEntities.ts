// 0 = info, 1 = success, 2 = warning, 3 = error
export type AlertType = 0 | 1 | 2 | 3;

export interface AlertData {
    title: string;
    message: string;
    type: AlertType;
    visible: boolean;
}
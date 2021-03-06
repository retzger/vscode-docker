/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import vscode = require('vscode');
import { IActionContext, UserCancelledError } from 'vscode-azureextensionui';
import { ext } from '../../extensionVariables';
import { VolumeTreeItem } from '../../tree/volumes/VolumeTreeItem';

export async function removeVolume(context: IActionContext, node: VolumeTreeItem | undefined): Promise<void> {
    let nodes: VolumeTreeItem[] = [];
    if (node) {
        nodes = [node];
    } else {
        nodes = await ext.volumesTree.showTreeItemPicker<VolumeTreeItem>(VolumeTreeItem.contextValue, { ...context, canPickMany: true, suppressCreatePick: true });
    }

    let confirmRemove: string;
    if (nodes.length === 0) {
        throw new UserCancelledError();
    } else if (nodes.length === 1) {
        node = nodes[0];
        confirmRemove = `Are you sure you want to remove volume "${node.label}"?`;
    } else {
        confirmRemove = "Are you sure you want to remove selected volumes?";
    }

    // no need to check result - cancel will throw a UserCancelledError
    await ext.ui.showWarningMessage(confirmRemove, { modal: true }, { title: 'Remove' });

    let removing: string = "Removing volume(s)...";
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: removing }, async () => {
        await Promise.all(nodes.map(async n => await n.deleteTreeItem(context)));
    });
}

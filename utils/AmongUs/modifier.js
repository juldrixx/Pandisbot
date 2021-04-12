'user strict';

const FileManagerUtils = require('../fileManager.js');

function getModifiers() {
    const fileName = 'amongusModifiers.json';

    try {
        const roles = FileManagerUtils.getAssetFile(fileName);
        Object.keys(roles).forEach(k => roles[k] = { ...roles[k], image: FileManagerUtils.getIconPath('AmongUs', k) });
        return roles;
    }
    catch (e) {
        throw new Error(e);
    }
}

function getModifier(name) {
    const modifiers = getModifiers();
    const modifier = modifiers[name];

    if (modifier)
        return modifier;
    else
        throw new Error(`Modifier "${modifier}" is missing.`);
}

module.exports = {
    getModifier,
    getModifiers,
}
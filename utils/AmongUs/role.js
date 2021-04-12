'user strict';

const FileManagerUtils = require('../fileManager.js');

function getRoles() {
  const fileName = 'amongusRoles.json';

  try {
    const roles = FileManagerUtils.getAssetFile(fileName);
    Object.keys(roles).forEach(k => roles[k] = { ...roles[k], image: FileManagerUtils.getIconPath('AmongUs', k) });
    return roles;
  }
  catch (e) {
    throw new Error(e);
  }
}

function getRole(name) {
  const roles = getRoles();
  const role = roles[name];

  if (role)
    return role;
  else
    throw new Error(`Role "${name}" is missing.`);
}

module.exports = {
  getRole,
  getRoles,
}
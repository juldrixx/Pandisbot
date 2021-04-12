'use strict';

module.exports =
{
  name: 'aus',
  description: 'Commandes liées à AmongUs',
  availableCommands: {
    Roles: require('./roles'),
    Role: require('./role'),
    Modifiers: require('./modifiers'),
    Modifier: require('./modifier'),
  }
};
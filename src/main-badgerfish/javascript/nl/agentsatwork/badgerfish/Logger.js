/**
 * Copyright © 2012, 2013 dr. ir. Jeroen M. Valk
 * 
 * This file is part of Badgerfish CPX. Badgerfish CPX is free software:
 * you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version. Badgerfish
 * CPX is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details. You
 * should have received a copy of the GNU Lesser General Public License along
 * with Badgerfish CPX. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @class nl.agentsatwork.badgerfish.Logger
 * 
 * @param logger
 *            {Object}
 */

Logger.FATAL = 0;
Logger.ERROR = 1;
Logger.WARN = 2;
Logger.INFO = 3;
Logger.DEBUG = 4;
Logger.TRACE = 5;

logger = new Object();
logger.trace = function()
{
};
logger.debug = logger.trace;
logger.info = logger.trace;
logger.warn = logger.trace;

/**
 * @constructor nl.agentsatwork.badgerfish.Logger
 * 
 * @param name
 *            {String} name of the logger
 */

var level = 4;

function Logger$trace(msg)
{
  ++CPX.COUNTER[Logger.TRACE];
  if (level >= Logger.TRACE)
  {
    console.log("[TRACE] " + name + ": " + msg);
  }
}

function Logger$debug(msg)
{
  ++CPX.COUNTER[Logger.DEBUG];
  if (level >= Logger.DEBUG)
  {
    console.log("[DEBUG] " + name + ": " + msg);
  }
}

function Logger$info(msg)
{
  ++CPX.COUNTER[Logger.INFO];
  if (level >= Logger.INFO)
  {
    console.log("[INFO] " + name + ": " + msg);
  }
}

function Logger$warn(msg)
{
  ++CPX.COUNTER[Logger.WARN];
  if (level >= Logger.WARN)
  {
    console.log("[WARN]  " + name + ": " + msg);
  }
}

function Logger$error(msg)
{
  ++CPX.COUNTER[Logger.ERROR];
  if (level >= Logger.ERROR)
  {
    console.log("[ERROR] " + name + ": " + msg);
  }
}

function Logger$fatal(msg)
{
  ++CPX.COUNTER[Logger.FATAL];
  if (level >= Logger.FATAL)
  {
    console.log("[FATAL] " + name + ": " + msg);
  }
}

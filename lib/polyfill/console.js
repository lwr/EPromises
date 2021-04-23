/*
 * Copyright (c) 2021 Coremail.cn, Ltd. All Rights Reserved.
 */

// https://stackoverflow.com/questions/3326650/console-is-undefined-error-for-internet-explorer

// define undefined methods as noop to prevent errors
const noop = () => {};

// eslint-disable-next-line no-global-assign
const con = console = self.console || {};

con['error'] = con.error || (con['log'] = con.log || noop);

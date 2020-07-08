const test = require('tape')

const Telemetry = require('./helpers/telemetry')
const portal = require('./fixtures/portal-self.json')
const portalPublic = require('./fixtures/public-user-self.json')
const portalAnonymous = require('./fixtures/portal-self-anonymous.json')

const options = {
  test: true,
  amazon: {
    userPoolID: 'us-east-1:aed3c2fe-4d28-431f-abb0-fca6e3167a25',
    app: {
      name: 'test',
      id: '36c5713d9d75496789973403b13548fd',
      version: '1.0'
    }
  }
}

const telemetry = new Telemetry(Object.assign({}, options, { portal }))

test('initiate telemetry w/ portal self and an internal user', t => {
  let telemetry
  const opts = Object.assign({}, options, { portal })
  try {
    telemetry = new Telemetry(opts)
  } catch (e) {
    t.fail(e)
  }
  t.equal(telemetry.user.username, 'DFenton_dcdev', 'picked up correct user name')
  t.equal(telemetry.user.accountType, 'In House')
  t.equal(telemetry.user.internalUser, true, 'detected internal user')
  t.end()
})

test('initiate telemetry w/ portal self and a public user', t => {
  let publicUser
  const opts = Object.assign({}, options, { portal: portalPublic })
  try {
    publicUser = new Telemetry(opts)
  } catch (e) {
    t.fail(e)
  }
  t.equal(publicUser.user.username, 'foobarbaz-google', 'picked up correct user name')
  t.equal(publicUser.user.accountType, 'Public', 'set correct account type')
  t.notOk(publicUser.user.internalUser, 'detected external user')
  t.end()
})

test('disabled with eueiEnabled: false', t => {
  let telemetry2
  const opts = Object.assign({}, options, { portal }, { portal: { eueiEnabled: false } })
  try {
    telemetry2 = new Telemetry(opts)
  } catch (e) {
    t.fail(e)
  }
  t.notOk(telemetry2.logPageView())
  t.end()
})

test('enabled for public anonymous user', t => {
  let anonymous
  const opts = Object.assign({}, options, { portal: portalAnonymous })
  try {
    anonymous = new Telemetry(opts)
  } catch (e) {
    t.fail(e)
  }
  t.ok(anonymous.logPageView(), 'tracking works')
  t.end()
})

test('log a page view', t => {
  const event = telemetry.logPageView('/foobar', {})
  t.ok(event.user, 'user attribute exists')
  t.notEqual(event.user, 'DFenton_dcdev', 'username is obfuscated')
  t.ok(event.org, 'org attribute exists')
  t.notEqual(event.org, 'bkrWlSKcjUDFDtgw', 'org id is obfuscated')
  t.equal(event.internalUser, true, 'detected internal user')
  t.equal(event.lastLogin, 1509983757000, 'included last login')
  t.equal(event.userSince, 1405088999000, 'included last user since')
  t.end()
})

// test('log an event', t => {
//   const event = telemetry.logEvent({
//     category: 'Dataset',
//     action: 'Attribute Inspect',
//     label: 'Crimes 2016',
//     datasetID: '1ef',
//     attribute: 'crime_type',
//     user: 'amazing_map_woman'
//   })
//   console.log(event)
//   // { category: 'Dataset',
//   // action: 'Attribute Inspect',
//   // label: 'Crimes 2016',
//   // datasetID: '1ef',
//   // attribute: 'crime_type',
//   // user:
//   //  '4ccce092622ac639aeafacd6b22a4787cc87919dccdef82a43113f0b4f637c5e',
//   // orgId:
//   //  'af69b9bcbdff673b9c55593cc8f1881c90aa059833e28108599547b49211770f',
//   // lastLogin: 1509983757000,
//   // userSince: 1405088999000,
//   // internalUser: true,
//   // accountType: 'In House' }

//   // t.notEqual(event.user, 'DFenton_dcdev', 'username is obfuscated')
//   // t.notEqual(event.orgId, 'bkrWlSKcjUDFDtgw', 'org id is obfuscated')
//   // t.equal(event.internalUser, true, 'detected internal user')
//   // t.equal(event.lastLogin, 1509983757000, 'included last login')
//   // t.equal(event.userSince, 1405088999000, 'included last user since')
//   t.end()
// })

test('log a workflow end to end', t => {
  telemetry.startWorkflow('test')
  t.deepEqual(telemetry.getWorkflow('test').steps, ['start'], 'collected workflow start')
  const workflowId = telemetry.getWorkflow('test').workflowId
  t.ok(workflowId, 'workflow has an id')

  telemetry.stepWorkflow('test', 'step 1')
  t.deepEqual(telemetry.getWorkflow('test').steps, ['start', 'step 1'], 'collected first workflow step')
  t.equal(telemetry.getWorkflow('test').workflowId, workflowId, 'workflow id is maintained')

  telemetry.stepWorkflow('test', 'step 2')
  t.deepEqual(telemetry.getWorkflow('test').steps, ['start', 'step 1', 'step 2'], 'collected second workflow step')
  t.equal(telemetry.getWorkflow('test').workflowId, workflowId, 'workflow id is maintained')

  telemetry.endWorkflow('test')
  t.notOk(telemetry.getWorkflow('test'), 'ended and deleted workflow')
  t.end()
})

test('cancel and replay a workflow', t => {
  telemetry.startWorkflow('test')
  telemetry.stepWorkflow('test', 'step a')
  telemetry.cancelWorkflow('test')
  t.notOk(telemetry.getWorkflow('test'), 'canceled and deleted workflow')

  telemetry.startWorkflow('test')
  telemetry.stepWorkflow('test', 'step b')
  t.deepEqual(telemetry.getWorkflow('test').steps, ['start', 'step b'], 'did not included canceled step')

  telemetry.endWorkflow('test')
  t.notOk(telemetry.getWorkflow('test'), 'ended and deleted workflow')

  t.end()
})

test('start a workflow with a step', t => {
  telemetry.stepWorkflow('test', 'step c')
  t.deepEqual(telemetry.getWorkflow('test').steps, ['start', 'step c'])

  telemetry.endWorkflow('test')
  t.notOk(telemetry.getWorkflow('test'), 'ended and deleted workflow')

  t.end()
})

test('Set demo and marketing org type to internal', t => {
  telemetry.setUser({ username: 'foobar', email: 'foo@bar.com' }, 'Demo and Marketing')
  t.ok(telemetry.user.internalUser, 'detected internal user')
  t.end()
})

test('Set in house org type to internal', t => {
  telemetry.setUser({ username: 'foobar', email: 'foo@bar.com' }, 'In House')
  t.ok(telemetry.user.internalUser, 'detected internal user')
  t.end()
})

test('init with the wrong type of options', t => {
  t.plan(1)
  try {
    new Telemetry('foobar') // eslint-disable-line
    t.pass('error not thrown')
  } catch (e) {
    t.fail('error should not be thrown')
  }
})

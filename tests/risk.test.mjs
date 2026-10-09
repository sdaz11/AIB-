import test from 'node:test';
import assert from 'node:assert/strict';
import {assessCase,SAMPLE_CASES} from '../lib/risk.ts';
test('canonical low 0',()=>{const r=assessCase(SAMPLE_CASES[0]);assert.equal(r.risk_score,0);assert.equal(r.risk_level,'LOW');assert.equal(r.recommended_action,'PROCEED')});
test('canonical medium 40',()=>{const r=assessCase(SAMPLE_CASES[1]);assert.equal(r.risk_score,40);assert.equal(r.risk_level,'MEDIUM');assert.equal(r.human_review,true)});
test('canonical high 100',()=>{const r=assessCase(SAMPLE_CASES[2]);assert.equal(r.risk_score,100);assert.equal(r.risk_level,'HIGH');assert.equal(r.recommended_action,'HOLD AND REVIEW')});
test('missing essential evidence fails safe',()=>{const r=assessCase({...SAMPLE_CASES[0],location:''});assert.equal(r.risk_level,'UNKNOWN');assert.equal(r.risk_score_valid,false);assert.equal(r.governance_route,'MANUAL REVIEW FAIL-SAFE ROUTE')});
test('zero baseline cannot pass',()=>{const r=assessCase({...SAMPLE_CASES[0],average_transaction:0});assert.equal(r.risk_level,'UNKNOWN');assert.equal(r.risk_score,null)});
test('no irreversible banking action is invoked',()=>{for(const row of SAMPLE_CASES)assert.equal(assessCase(row).irreversible_action_executed,false)});

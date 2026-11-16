"""Deterministic contract behavior under a GenLayer shim; not live consensus proof."""
import importlib.util
import json
import sys
import types
import unittest
from copy import deepcopy

class Address:
    def __init__(self, value): self.as_hex = value
class TreeMap(dict):
    @classmethod
    def __class_getitem__(cls, _): return cls
class UserError(Exception): pass
identity = lambda fn: fn
gl = types.SimpleNamespace(Contract=object, public=types.SimpleNamespace(write=identity, view=identity),
    vm=types.SimpleNamespace(UserError=UserError), message=types.SimpleNamespace(sender_address=Address('B')),
    nondet=types.SimpleNamespace(), eq_principle=types.SimpleNamespace())
sys.modules['genlayer'] = types.SimpleNamespace(gl=gl, Address=Address, TreeMap=TreeMap, u256=int)
spec = importlib.util.spec_from_file_location('recovery_v21', 'contracts/verified_recovery_v21.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class RecoveryTests(unittest.TestCase):
    def setUp(self):
        self.c = {'id':1,'stage':'DECIDED','verdict':'REWORK_B','worker_a':'a','worker_b':'b',
                  'task_spec':'Produce a correct report matching the approved source.',
                  'source_data':'Approved invoice total is 20.', 'a_output':'Approved total: 20',
                  'b_output':'Reported total: 27', 'a_sha256':m.digest('Approved total: 20'),
                  'b_sha256':m.digest('Reported total: 27')}
        gl.get_contract_at = lambda _: types.SimpleNamespace(view=lambda: types.SimpleNamespace(get_case=lambda _:m.canonical(self.c)))
        gl.message.sender_address = Address('b')
        gl.eq_principle.prompt_comparative = lambda fn, principle: fn()
        self.g = m.VerifiedRecovery('court')
        self.g.attempts, self.g.recoveries = TreeMap(), TreeMap()
        self.answer('PASS')
    def answer(self, verdict):
        self.raw = {'checks':[{'criterion':k,'result':verdict,'reason':'Compared against the frozen evidence.',
                         'references':[{'field':('agreement' if k=='dependency' else k),'quote':self.c['source_data'] if k=='source' else self.c['task_spec']}, {'field':'revision','quote':'Reported total:'}]} for k in m.CRITERIA]}
        gl.nondet.exec_prompt = lambda _: json.dumps(self.raw)
    def submit(self, text='Reported total: 20'):
        return self.g.submit_revision(1,text,m.digest(text))
    def state(self): return json.loads(self.g.get_recovery(1))
    def test_success_requires_explicit_finalization(self):
        i=self.submit(); self.assertEqual(self.state()['state'],'SUBMITTED')
        self.assertEqual(self.g.assess_revision(i),'PASS'); self.assertEqual(self.state()['state'],'PASS')
        self.assertEqual(self.g.finalize_recovery(1,i),'RESOLVED')
        self.assertEqual(self.c['stage'],'DECIDED')
        self.assertEqual(self.state()['resolution']['revision_sha256'],m.digest('Reported total: 20'))
    def test_wrong_worker(self):
        gl.message.sender_address=Address('owner')
        with self.assertRaisesRegex(UserError,'responsible'): self.submit()
        self.assertEqual(self.g.attempt_count,0)
    def test_hash_mismatch(self):
        with self.assertRaisesRegex(UserError,'hash mismatch'): self.g.submit_revision(1,'some revision','a'*64)
    def test_original_rejected(self):
        with self.assertRaisesRegex(UserError,'unchanged'): self.submit(self.c['b_output'])
    def test_pending_cannot_replace_or_finalize(self):
        i=self.submit()
        with self.assertRaisesRegex(UserError,'assessed first'): self.submit('Another revision')
        with self.assertRaisesRegex(UserError,'PASS required'): self.g.finalize_recovery(1,i)
    def test_fail_then_pass_preserves_history(self):
        i=self.submit('Reported total: 21'); self.answer('FAIL'); self.g.assess_revision(i)
        j=self.submit(); self.answer('PASS'); self.g.assess_revision(j)
        self.assertEqual(json.loads(self.g.get_attempt(i))['status'],'FAIL')
        with self.assertRaisesRegex(UserError,'stale'): self.g.finalize_recovery(1,i)
        self.assertEqual(self.g.finalize_recovery(1,j),'RESOLVED')
    def test_review_and_attempt_limit(self):
        self.answer('REVIEW')
        i=self.submit(); self.g.assess_revision(i)
        with self.assertRaisesRegex(UserError,'PASS required'): self.g.finalize_recovery(1,i)
        j=self.submit('Different revision text'); self.g.assess_revision(j)
        with self.assertRaisesRegex(UserError,'limit'): self.submit('Third revision text')
    def test_no_duplicate_or_reassessment(self):
        i=self.submit(); self.answer('FAIL'); self.g.assess_revision(i)
        with self.assertRaisesRegex(UserError,'duplicate'): self.submit()
        with self.assertRaisesRegex(UserError,'pending'): self.g.assess_revision(i)
    def test_A_never_closes_B(self):
        self.c['verdict']='REWORK_A'; gl.message.sender_address=Address('a')
        i=self.submit(); self.g.assess_revision(i)
        self.assertEqual(self.g.finalize_recovery(1,i),'UPSTREAM_VERIFIED_B_REVIEW_REQUIRED')
    def test_shared_and_unknown_block(self):
        for verdict in ('SHARED','UNVERIFIABLE','PENDING'):
            self.c['verdict']=verdict
            with self.assertRaises(UserError): self.submit()
    def test_snapshot_change_blocks_assessment(self):
        i=self.submit(); self.c['task_spec']='Changed agreement'
        with self.assertRaisesRegex(UserError,'snapshot changed'): self.g.assess_revision(i)
    def test_snapshot_change_blocks_finalize(self):
        i=self.submit(); self.g.assess_revision(i); self.c['source_data']='Changed source'
        with self.assertRaisesRegex(UserError,'snapshot changed'): self.g.finalize_recovery(1,i)
    def test_malformed_or_fabricated_reference_is_review(self):
        i=self.submit(); self.raw['checks'][0]['references'][0]['quote']='invented supporting evidence'
        self.assertEqual(self.g.assess_revision(i),'REVIEW')
    def test_all_three_checks_required(self):
        i=self.submit(); self.raw['checks'].pop()
        self.assertEqual(self.g.assess_revision(i),'REVIEW')
    def test_uncertainty_wins_over_failure(self):
        i=self.submit(); self.raw['checks'][0]['result']='REVIEW'; self.raw['checks'][1]['result']='FAIL'
        self.assertEqual(self.g.assess_revision(i),'REVIEW')
    def test_duplicate_criteria_is_review(self):
        i=self.submit(); self.raw['checks'][0]['criterion']='source'
        self.assertEqual(self.g.assess_revision(i),'REVIEW')
    def test_cannot_finalize_twice(self):
        i=self.submit(); self.g.assess_revision(i); self.g.finalize_recovery(1,i)
        with self.assertRaises(UserError): self.g.finalize_recovery(1,i)
        with self.assertRaises(UserError): self.submit('Another changed output')
    def test_cross_case_attempt_block(self):
        i=self.submit(); self.g.assess_revision(i)
        self.c['id']=2
        with self.assertRaisesRegex(UserError,'wrong case'): self.g.finalize_recovery(2,i)

    def test_v21_initial_run_is_audited(self):
        i=self.submit()
        self.assertEqual(self.g.assess_revision(i),'PASS')
        a=json.loads(self.g.get_attempt(i))
        self.assertEqual(a['assessment_runs'],1)
        self.assertEqual(len(a['assessment_history']),1)
        self.assertEqual(a['assessment_history'][0]['verdict'],'PASS')
        self.assertFalse(a['assessment_history'][0]['format_fallback'])

    def test_v21_invalid_format_can_retry_to_pass(self):
        i=self.submit()
        self.raw['checks'].pop()
        self.assertEqual(self.g.assess_revision(i),'REVIEW')
        a=json.loads(self.g.get_attempt(i))
        self.assertEqual(a['assessment_runs'],1)
        self.assertTrue(a['assessment_history'][0]['format_fallback'])
        with self.assertRaisesRegex(UserError,'PASS required'): self.g.finalize_recovery(1,i)
        self.answer('PASS')
        self.assertEqual(self.g.retry_format_review(i),'PASS')
        a=json.loads(self.g.get_attempt(i))
        self.assertEqual([h['verdict'] for h in a['assessment_history']],['REVIEW','PASS'])
        self.assertEqual([h['run'] for h in a['assessment_history']],[1,2])
        self.assertEqual(a['assessment_runs'],2)
        self.assertEqual(self.g.finalize_recovery(1,i),'RESOLVED')

    def test_v21_valid_semantic_review_cannot_be_retried(self):
        self.answer('REVIEW')
        i=self.submit()
        self.assertEqual(self.g.assess_revision(i),'REVIEW')
        a=json.loads(self.g.get_attempt(i))
        self.assertEqual(len(a['assessment']['checks']),3)
        with self.assertRaisesRegex(UserError,'only malformed'): self.g.retry_format_review(i)
        self.assertEqual(json.loads(self.g.get_attempt(i))['assessment_runs'],1)

    def test_v21_foreign_signer_cannot_spend_retry(self):
        i=self.submit(); self.raw['checks'].pop()
        self.g.assess_revision(i)
        gl.message.sender_address=Address('owner')
        with self.assertRaisesRegex(UserError,'revision signer only'): self.g.retry_format_review(i)
        self.assertEqual(json.loads(self.g.get_attempt(i))['assessment_runs'],1)

    def test_v21_bounded_assessment_runs_never_grant_third_revision(self):
        i=self.submit()
        self.raw['checks'].pop()
        self.assertEqual(self.g.assess_revision(i),'REVIEW')
        self.assertEqual(self.g.retry_format_review(i),'REVIEW')
        self.assertEqual(self.g.retry_format_review(i),'REVIEW')
        a=json.loads(self.g.get_attempt(i))
        self.assertEqual(a['assessment_runs'],3)
        self.assertEqual(len(a['assessment_history']),3)
        with self.assertRaisesRegex(UserError,'retry limit'): self.g.retry_format_review(i)
        j=self.submit('Reported total: 22')
        self.assertEqual(json.loads(self.g.get_attempt(j))['round'],2)
        self.answer('FAIL'); self.assertEqual(self.g.assess_revision(j),'FAIL')
        with self.assertRaisesRegex(UserError,'two-attempt limit'): self.submit('Third correction')

    def test_v21_retry_cannot_change_failed_assessment(self):
        self.answer('FAIL')
        i=self.submit();self.assertEqual(self.g.assess_revision(i),'FAIL')
        with self.assertRaisesRegex(UserError,'not current REVIEW'): self.g.retry_format_review(i)
        self.assertEqual(json.loads(self.g.get_attempt(i))['status'],'FAIL')

    def test_v21_old_review_cannot_retry_after_next_revision(self):
        i=self.submit();self.raw['checks'].pop()
        self.assertEqual(self.g.assess_revision(i),'REVIEW')
        j=self.submit('Another distinct correction')
        with self.assertRaisesRegex(UserError,'not current REVIEW'): self.g.retry_format_review(i)
        self.assertEqual(json.loads(self.g.get_attempt(j))['status'],'SUBMITTED')

    def test_v21_retry_preserves_original_snapshot_hash(self):
        i=self.submit();self.raw['checks'].pop()
        self.g.assess_revision(i)
        before=json.loads(self.g.get_attempt(i))
        self.answer('PASS');self.g.retry_format_review(i)
        after=json.loads(self.g.get_attempt(i))
        self.assertEqual(before['snapshot_sha256'],after['snapshot_sha256'])
        self.assertEqual(before['new_sha256'],after['new_sha256'])
        self.assertEqual(before['new_output'],after['new_output'])
        self.assertEqual(after['assessment_history'][0]['assessment_sha256'],
                         m.digest(m.canonical(before['assessment'])))

    def test_v21_retry_blocks_changed_court(self):
        i=self.submit();self.raw['checks'].pop()
        self.g.assess_revision(i)
        self.c['task_spec']='Tampered'
        with self.assertRaisesRegex(UserError,'snapshot changed'): self.g.retry_format_review(i)

    def test_v21_stats_policy(self):
        st=json.loads(self.g.stats())
        self.assertEqual(st['version'],'2.1.0')
        self.assertEqual(st['max_attempts'],2)
        self.assertEqual(st['max_assessment_runs'],3)
        self.assertEqual(st['retry_policy'],'FORMAT_REVIEW_ONLY')

    def test_v21_unauthorized_first_assessment_does_not_consume_a_run(self):
        i=self.submit()
        gl.message.sender_address=Address('owner')
        with self.assertRaisesRegex(UserError,'revision signer only'): self.g.assess_revision(i)
        a=json.loads(self.g.get_attempt(i))
        self.assertEqual(a['status'],'SUBMITTED')
        self.assertEqual(a['assessment_runs'],0)
        self.assertEqual(a['assessment_history'],[])

if __name__ == '__main__': unittest.main()

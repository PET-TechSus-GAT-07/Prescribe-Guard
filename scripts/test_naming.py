import sqlite3
import unittest

from data_pipeline_common import init_db, standardize_names


class NamingTests(unittest.TestCase):
    def test_merge_preserves_evidence_and_is_idempotent(self):
        db = sqlite3.connect(':memory:')
        init_db(db)
        for ident, name in enumerate(['Acetaminofeno', 'Paracetamol', 'Varfarina', 'Ceftriazona', 'Ceftriaxona'], 1):
            db.execute('INSERT INTO medications (id,name,updated_at) VALUES (?,?,?)', (ident, name, 'test'))
        for name, severity, text in [('Acetaminofeno', 'major', 'origem A'), ('Paracetamol', 'moderate', 'origem B')]:
            db.execute('INSERT INTO interactions (pair_key,drug_a_name,drug_b_name,severity,mechanism,updated_at) VALUES (?,?,?,?,?,?)', (name.casefold()+'||varfarina', name, 'Varfarina', severity, text, 'test'))
        db.commit()
        standardize_names(db)
        row = db.execute('SELECT severity,mechanism FROM interactions').fetchone()
        self.assertEqual(row[0], 'major')
        self.assertIn('origem A', row[1])
        self.assertIn('origem B', row[1])
        self.assertEqual(db.execute('SELECT count(*) FROM medications').fetchone()[0], 3)
        before = list(db.iterdump())
        standardize_names(db)
        self.assertEqual(before, list(db.iterdump()))
        self.assertEqual(db.execute('PRAGMA integrity_check').fetchone()[0], 'ok')


if __name__ == '__main__':
    unittest.main()

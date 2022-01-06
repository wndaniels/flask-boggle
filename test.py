from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle


class FlaskTests(TestCase):

    def setUp(self):
        """Stuff to do before every test"""

        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_homepage(self):
        """Make sure inforamtion is in the session and HTML is displayed"""

        with self.client:
            res = self.client.get('/')
            self.assertIn('board', session)
            self.assertIsNone(session.get('highscore'))
            self.assertIsNone(session.get('numplays'))
            self.assertIn(b'Time Remaining:', res.data)
            self.assertIn(b'Current Score:', res.data)
            self.assertIn(b'High Score:', res.data)

    def test_valid_word(self):
        """Test if word entered is valid"""

        with self.client as client:
            with client.session_transaction() as session:
                session['board'] = [["S", "N", "A", "K", "E"],
                                    ["S", "N", "A", "K", "E"],
                                    ["S", "N", "A", "K", "E"],
                                    ["S", "N", "A", "K", "E"],
                                    ["S", "N", "A", "K", "E"]]
            res = self.client.get('/check-word?word=snake')
            self.assertEqual(res.json['result'], 'ok')

    def test_invalid_word(self):
        """Test if word entered is valid and on board"""

        self.client.get('/')
        res = self.client.get('/check-word?word=invalid')
        self.assertEqual(res.json['result'], 'not-on-board')

    def test_english_word(self):
        """Test if word entered is a valid english word"""

        self.client.get('/')
        res = self.client.get('/check-word?word=abcdefg')
        self.assertEqual(res.json['result'], 'not-word')

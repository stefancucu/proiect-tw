""" Tema 2 - jocuri - X si O
    Se va implementa urmatorul joc:
    Jocul se desfasoara pe un grid NxN cu 5≤N≤10 (utilizatorul va fi întrebat în legătură cu dimensiunea tablei).
    Este turn based
    Un jucator foloseste simbolul x si celalalt 0 ( o sa ii numim pe scurt jucatorii x si 0)
    Jucatorul x pune simbolul primul pe tabla.
    Mutarile sunt de doua feluri:
    * punerea unui simbol intr-un loc gol
    * saltul peste un simbol (in stilul jocului dame). Un jucator poate sari peste simbolul unui alt jucator doar pe diagonala, daca pe acea diagonala, imediat dupa simbolul jucatorului e un loc liber. Totusi, la urmatoarea mutare jucatorul opus nu are voie sa puna simbolul in locul de unde a fost luat.
    Scopul jocului este sa se creeze o configuratie de 4 simboluri vecine toate intre ele doua cate doua (practic formand un "patrat" de simboluri).
    La afișarea gridului în consolă, se vor afișa în dreptul liniilor și coloanelor și numerele lor (indicii începând de la 0) ca să poată identifica utilizatorul mai ușor coordonatele locului în care vrea să mute.
"""

import sys
import time
import copy
import pygame
import statistics
import os


def check_if_square(matrix: list, start_pos: tuple) -> tuple:
    """ Verifica daca exista un patrat de 2x2 care sa inceapa pe pozitia curenta

    Args:
        matrix (list): matricea in care se cauta patratul
        start_pos (tuple): coltul din stanga sus al patratului

    Returns:
        bool: True daca incepe un patrat de 2x2 la start_pos, altfel False
        str: caracterul aflat la pozitia start_pos
    """
    try:
        if matrix[start_pos[0]][start_pos[1]] == matrix[start_pos[0]][start_pos[1] + 1] == matrix[start_pos[0] + 1][start_pos[1]] == matrix[start_pos[0] + 1][start_pos[1] + 1]:
            return True, matrix[start_pos[0]][start_pos[1]]
        else:
            return False, None
    except:
        return False, None


def check_if_empty_square(matrix: list, start_pos: tuple, player: str) -> tuple:
    """ Verifica daca se mai poate forma o configuratie castigatoare la pozitia curenta

    Args:
        matrix (list): matricea in care se cauta configuratia 
        start_pos (tuple): coltul stanga-sus al patratului in care se verifica
        player (str): jucatorul pentru care se verifica

    Returns:
        int: cate pozitii sunt ocupate in patratul din pozitia curenta
        bool: True daca patratul din pozitia curenta nu este ocupat de adversar, False altfel
    """
    try:
        num_occupied = (matrix[start_pos[0]][start_pos[1]] == player) + (matrix[start_pos[0]][start_pos[1] + 1] == player) + \
            (matrix[start_pos[0] + 1][start_pos[1]] == player) + (matrix[start_pos[0] + 1][start_pos[1] + 1] == player)
        return num_occupied, (matrix[start_pos[0]][start_pos[1]] == Game.BLANK or matrix[start_pos[0]][start_pos[1]] == player) and \
            (matrix[start_pos[0]][start_pos[1] + 1] == Game.BLANK or matrix[start_pos[0]][start_pos[1] + 1] == player) and \
            (matrix[start_pos[0] + 1][start_pos[1]] == Game.BLANK or matrix[start_pos[0] + 1][start_pos[1]] == player) and \
            (matrix[start_pos[0] + 1][start_pos[1] + 1] == Game.BLANK or matrix[start_pos[0] + 1][start_pos[1] + 1] == player) 
    except:
        return 0, False


def get_diagonal_block(a1: int, b1: int, a2: int, b2: int) -> tuple:
    """ Verifica daca (a1, b1) si (a2, b2) sunt pe aceeasi diagonala, cu o pozitie intre ele
    
    Args:
        a1 (int): abcisa primului punct
        b1 (int): ordonata primului punct
        a2 (int): abcisa celui de al 2lea punct
        b2 (int): ordonata celui de al 2lea punct

    Returns:
        tuple: valoarea pozitiei intermediare, daca (a1, b1) si (a2, b2) sunt valide, altfel None
    
    """
    if abs(a1 - a2) == abs(b1 - b2) and abs(a1 - a2) == 2:
        return (a1 + a2)//2, (b1 + b2)//2
    else:
        return None


def check_if_in_square(square_pos: tuple, current_pos: tuple) -> bool:
    """ Verifica daca pozitia curenta se afla in patrat
    
    Args:
        square_pos (tuple): coltul stanga-sus al patratului
        current_pos (tuple): pozitia curenta

    Returns:
        bool: True daca current_pos se afla in patrat, False altfel
        
    """
    return current_pos == square_pos or current_pos == (square_pos[0], square_pos[1] + 1) or \
        current_pos == (square_pos[0] + 1, square_pos[1]) or current_pos == (square_pos[0] + 1, square_pos[1] + 1)


class Game:
    N = 5
    PLAYER_MAX = 'X'
    PLAYER_MIN = 'O'
    BLANK = '#'


    def __init__(self, state_matrix: list = None, banned_pos: tuple = None) -> None:
        """ Constructorul clasei Game

        Args:
            state_matrix (list): matricea care reprezinta starea curenta a tablei de joc
            banned_pos (tuple): punctul pe care nu se poate pune o piesa, datorita mutarii de capturare

        """

        self.state_matrix = state_matrix or [['#' for _ in range(Game.N)] for _ in range(Game.N)]
        self.banned_pos = banned_pos
        self.winner_config = None
    

    @classmethod
    def get_opposite_player(cls, player: str) -> str:
        """ Obtine jucatorul advers
        
        Args:
            player (str): jucatorul curent
        
        Returns:
            str: jucatorul advers

        """
        return cls.PLAYER_MAX if player == cls.PLAYER_MIN else cls.PLAYER_MIN 


    def check_if_final(self):
        """ Verifica daca jocul s-a terminat
        
        Returns:
            str | bool: Daca nu s-a terminat, jocul va returna False; altfel va returna fie jucatorul care a castigat, fie 'remiza'

        """
        is_final = False
        winner_config = None
        for i in range(Game.N - 1):
            for j in range(Game.N - 1):
                check, player = check_if_square(self.state_matrix, start_pos=(i,j))
                if not check or player == Game.BLANK:
                    continue
                else:
                    is_final = True
                    winner_config = (i, j)
                    break
            if is_final:
                break
        if is_final:
            self.winner_config = winner_config
            return player
        else:
            remiza = True
            for row in self.state_matrix:
                if Game.BLANK in row:
                    remiza = False
                    break
            return 'remiza' if remiza else False
    

    def generate_moves(self, player: str) -> list:
        """ Generarea mutarilor succesor
        
        Args:
            player (str): jucatorul curent

        Returns:
            list[list[list[str]]]: lista de matrice ce reprezinta starile mutarilor succesor posibile 

        """
        moves = []
        for i in range(Game.N):
            for j in range(Game.N):
                try:
                    if i == self.banned_pos[0] and j == self.banned_pos[1]:
                        continue
                except:
                    pass
                if self.state_matrix[i][j] != Game.BLANK:
                    continue
                # Verifica daca in diagonala se afla ceva opus -> generarea mutarilor tip capturare
                enemy = Game.get_opposite_player(player)
                for pos in [(-1, -1), (-1, 1), (1, -1), (1, 1)]:
                    try:
                        if self.state_matrix[i + pos[0]][j + pos[1]] == enemy and self.state_matrix[i + 2 * pos[0]][j + 2 * pos[1]] == player:
                            new_matrix = copy.deepcopy(self.state_matrix)
                            new_matrix[i][j] = player
                            new_matrix[i + pos[0]][j + pos[1]] = Game.BLANK
                            new_matrix[i + 2 * pos[0]][j + 2 * pos[1]] = Game.BLANK
                            moves.append(Game(new_matrix, banned_pos=(i + pos[0], j + pos[1])))
                    except:
                        pass 
                new_matrix = copy.deepcopy(self.state_matrix)
                new_matrix[i][j] = player  
                moves.append(Game(new_matrix))
        return moves


    def get_empty_squares(self, player: str, weighted: bool = False) -> int:
        """ Calculeaza numarul de patrate libere
        
        Args:
            player (str): jucatorul curent
            weighted (bool): daca suma este ponderata de numarul de patrate ocupate de jucatorul curent sau nu
                            (False == metoda 1 de estimare a scorului, True == metoda 2)

        Returns:
            int: numarul de patrate libere, pe care se mai pot face configuratii castigatoare

        """
        count = 0
        for i in range(Game.N):
            for j in range(Game.N):
                num_occupied, check = check_if_empty_square(self.state_matrix, (i, j), player)
                if not check: 
                    continue
                count += (num_occupied + 1) if weighted else 1
        return count

    def get_score(self, depth: int, mode: str = "score_1") -> int:
        """ Estimeaza scorul unei mutari
        
        Args:
            depth (int): adancimea curenta
            mode (str): modul de calcul al scorului
        
        Returns:
            int: scorul estimativ al unei mutari

        """
        final_out = self.check_if_final()
        if final_out == Game.PLAYER_MAX:
            return int(1e+8) + depth
        elif final_out == Game.PLAYER_MIN:
            return - (int(1e+8) + depth)
        elif final_out == 'remiza':
            return 0
        else:
            if mode == "score_1":
                return self.get_empty_squares(Game.PLAYER_MAX) - self.get_empty_squares(Game.PLAYER_MIN)
            else:
                return self.get_empty_squares(Game.PLAYER_MAX, weighted=True) - self.get_empty_squares(Game.PLAYER_MIN, weighted=True)

    def __str__(self) -> str:
        res = ' |' + ' '.join([str(col) for col in range(Game.N)]) + '\n'
        res += '-+' + '-' * 2 * Game.N + '\n'
        for i, line in enumerate(self.state_matrix):
            res += str(i) + '|' + ' '.join(line) + '\n'
        return res

    def __repr__(self) -> str:
        return self.__str__() 

class GameState:
    def __init__(self, game: Game, player: str, depth: int, score: int = 0) -> None:
        """ Constructorul clasei GameState

        Args:
            game (Game): instanta clasei Game care reprezinta starea actuala
            player (str): jucatorul curent
            depth (int): adancimea curenta
            score (int): scorul starii
        
        """
        self.game = game
        self.player = player
        self.depth = depth
        self.score = score
        self.nodes = 1

        self.moves = []
        self.best_move = None
        

    def generate_moves(self) -> list:
        """ Genereaza starile succesor

        Returns:
            list[GameState]: lista cu starile succesor
        
        """
        moves = self.game.generate_moves(self.player)
        enemy = self.game.get_opposite_player(self.player)

        return [GameState(move, enemy, self.depth - 1) for move in moves]

    
    def __str__(self) -> str:
        return '\n' + str(self.game)+ f"""
Current player: {self.player}
Depth: {self.depth}
Score: {self.score}
Nodes generated: {self.nodes}"""

    def __repr__(self) -> str:
        return str(self)


def min_max(state: GameState, score_mode: str = "score_2"):
    """ Algoritmul min_max
    
    Args:
        state (GameState): starea curenta a jocului
        score_mode (str): modul de calcul al scorului care va fi utilizat
    
    Returns:
        GameState: mutarea curenta, modificata pentru a contine cea mai buna mutare succesor posibila

    """
    if state.depth == 0 or (state.game.check_if_final() != False):
        state.score = state.game.get_score(state.depth, mode=score_mode)
        return state

    state.moves = state.generate_moves()
    moves_with_score = [min_max(move) for move in state.moves]
    state.nodes = sum([move.nodes for move in moves_with_score])

    if state.player == Game.PLAYER_MAX:
        state.best_move = max(moves_with_score, key=lambda x : x.score)
    else:
        state.best_move = min(moves_with_score, key=lambda x: x.score)
    state.score = state.best_move.score
    return state


def alpha_beta(alpha: int, beta: int, state: GameState, score_mode: str = "score_2"):
    """ Algoritmul alpha_beta
    
    Args:
        alpha (int): marginea din stanga a intervalului 
        beta (int): marginea din dreapta a intervalului
        state (GameState): starea curenta a jocului
        score_mode (str): modul de calcul al scorului care va fi utilizat
    
    Returns:
        GameState: mutarea curenta, modificata pentru a contine cea mai buna mutare succesor posibila

    """
    if state.depth == 0 or (state.game.check_if_final() != False):
        state.score = state.game.get_score(state.depth, score_mode)
        return state
    
    if alpha > beta:
        return state
    
    state.moves = state.generate_moves()
    state.moves.sort(key=lambda x: x.score)
    total_nodes = 0

    if state.player == Game.PLAYER_MAX:
        current_score = float('-inf')
        for move in state.moves:
            new_state = alpha_beta(alpha, beta, move)
            total_nodes += new_state.nodes
            if current_score < new_state.score:
                state.best_move = new_state
                current_score = new_state.score
            if alpha < new_state.score:
                alpha = new_state.score
                if alpha >= beta:
                    break
    
    elif state.player == Game.PLAYER_MIN:
        current_score = float('inf')
        for move in state.moves:
            new_state = alpha_beta(alpha, beta, move)
            total_nodes += new_state.nodes
            if current_score > new_state.score:
                state.best_move = new_state
                current_score = new_state.score
            if beta > new_state.score:
                beta = new_state.score
                if alpha >= beta:
                    break
    state.nodes = total_nodes
    state.score = state.best_move.score
    return state


def save_game_file(state, difficulty, algo, mode, time_elapsed, nodes_stats, nr_turns_X, nr_turns_O, time_stats):
    """ Salveaza jocul curent intr-un fisier
    
    Args:
        state (GameState): starea curenta a jocului
        difficulty (int): dificultatea jocului
        algo (bool): algoritmul folosit in joc
        mode (int): modul jocului (PVP/PVE/CPU)
        time_elapsed (float): cate secunde a durat jocul pana acum
        nodes_stats (list[int]): cate noduri au fost generate in fiecare tura precedenta
        nr_turns_X (int): cate ture a avut X
        nr_turns_O (int): cate ture a avut O

    """
    count = 0
    try:
        count = len([f for f in os.listdir(UI.SAVE_PATH) if os.path.isfile(os.path.join(UI.SAVE_PATH, f))])
    except:
        try:
            os.mkdir(UI.SAVE_PATH)
        except Exception as e:
            print(f"NU ARE DREPTURI DE CREAT DIRECTOR {e}")
            return
    count += 1
    savefile = open(os.path.join(UI.SAVE_PATH, f"save{count}.game"), "w")
    savefile.write(str(Game.N) + '\n')
    savefile.write(Game.PLAYER_MAX + '\n')
    savefile.write(Game.PLAYER_MIN + '\n')
    savefile.write(Game.BLANK + '\n')
    savefile.write(str(state.game.banned_pos) + '\n')
    savefile.write(state.player + '\n')
    savefile.write(str(state.depth) + '\n')
    savefile.write(str(state.score) + '\n')
    savefile.write(str(state.nodes) + '\n')
    savefile.write(str(difficulty) + '\n')
    savefile.write(str(algo) + '\n')
    savefile.write(str(mode) + '\n')
    savefile.write(str(time_elapsed) + '\n')
    savefile.write(' '.join([str(i) for i in nodes_stats]) + '\n')
    savefile.write(str(nr_turns_X) + '\n')
    savefile.write(str(nr_turns_O) + '\n')
    savefile.write(' '.join([str(i) for i in time_stats]) + '\n')
    for line in state.game.state_matrix:
        savefile.write(' '.join(line) + '\n')
    print(f'File {os.path.join(UI.SAVE_PATH, f"save{count}.game")} saved!')


def load_game_file(save_path: str):
    """ Incarca un joc dintr-un fisier
    
    Args:
        save_path (str): fisierul din care se va incarca jocul

    Returns:
        loaded_state (GameState): starea curenta a jocului
        difficulty (int): dificultatea jocului
        algo (bool): algoritmul folosit in joc
        mode (int): modul jocului (PVP/PVE/CPU)
        time_elapsed (float): cate secunde a durat jocul pana acum
        nodes_stats (list[int]): cate noduri au fost generate in fiecare tura precedenta
        nr_turns_X (int): cate ture a avut X
        nr_turns_O (int): cate ture a avut O

    """
    try:
        savefile = open(os.path.join(UI.SAVE_PATH, save_path), "r")
    except Exception as e:
        print(f"NU SE POATE CITI FISIERUL {os.path.join(UI.SAVE_PATH, save_path)}: {e}")
        return None
    lines = savefile.readlines()
    print(int(lines[0]))
    Game.N = int(lines[0])
    Game.PLAYER_MAX = lines[1].strip()
    Game.PLAYER_MAX = lines[2].strip()
    Game.BLANK = lines[3].strip()
    if lines[4].strip() == 'None':
        banned_pos = None 
    else:
        banned_pos = (lines[4].strip('()\n').split(',')[0], lines[4].strip('()\n').split(',')[1])
        print(banned_pos) 
    player = lines[5].strip()
    depth = int(lines[6])
    score = int(lines[7])
    nodes = int(lines[8])
    difficulty = int(lines[9])
    algo = bool(lines[10])
    mode = int(lines[11])
    time_elapsed = float(lines[12])
    nodes_stats = [int(node) for node in lines[13].split()]
    nr_turns_X = int(lines[14])
    nr_turns_O = int(lines[15])
    time_stats = [float(node) for node in lines[16].split()]
    state_matrix = []
    for line in lines[17:]:
        state_matrix.append(line.strip().split())
    
    loaded_state = GameState(Game(state_matrix, banned_pos), player, depth, score)
    loaded_state.nodes = nodes

    return loaded_state, difficulty, algo, mode, time_elapsed, nodes_stats, nr_turns_X, nr_turns_O, time_stats


class Button:
    """ Buton in cadrul interfetei jocului """
    def __init__(self, image, pos, text_input=None, font=None, text_color=None):
        """ Constructorul clasei Button
        
        Args:
            image (Surface): imaginea de baza a butonului
            pos (Rect): locatia butonului
            text_input (str): textul butonului
            font (Surface): fontul butonului
            text_color (ColorValue): culoarea butonului

        """
        self.image = image
        self.font = font
        self.text_input = text_input
        self.text_color = text_color
        self.text = None
        if text_input is not None and font is not None and text_color is not None:
            self.text = self.font.render(self.text_input, True, self.text_color)
            self.text_rect = self.text.get_rect(center=(pos[0], pos[1]))
        if self.image is None and self.text is not None:
            self.image = self.text
        self.rect = self.image.get_rect(center=(pos[0], pos[1]))
        

    def update(self, screen):
        """ Afiseaza butonul pe ecran

        Args:
            screen (Surface): ecranul pe care se afiseaza butonul
        
        """
        if self.image is not None:
            screen.blit(self.image, self.rect)
        if self.text is not None:
            screen.blit(self.text, self.text_rect)

    def check(self, position):
        """ Verifica daca butonul a fost apasat
        
        Args:
            position (Rect): Locatia evenimentului de click
        
        Returns:
            bool: True daca butonul a fost apasat, False altfel

        """
        if position[0] in range(self.rect.left, self.rect.right) and position[1] in range(self.rect.top, self.rect.bottom):
            return True
        return False

class UI:
    """ Interfata jocului """
    COLOR_BACKGROUND = "#267AE9"
    BANNER_TITLE = pygame.image.load("./resurse/sprites/UI_Flat_Banner_01_Upward.png") # 96W x 32H
    BUTTON_LARGE_LOCK = pygame.image.load("./resurse/sprites/UI_Flat_Button_Large_Lock_01a1.png")
    UI_FRAME = pygame.image.load("./resurse/sprites/UI_Flat_Frame_02_Standard.png")
    BUTTON_SMALL_LOCK = pygame.image.load("./resurse/sprites/UI_Flat_Button_Small_Lock_01a1.png")
    BUTTON_SMALL_PRESS = pygame.image.load("./resurse/sprites/UI_Flat_Button_Small_Press_02a3.png")
    TOGGLE_ON = pygame.image.load("./resurse/sprites/toggle_on.png")
    TOGGLE_OF = pygame.image.load("./resurse/sprites/toggle_off.png")
    CLOSE_IMG = pygame.image.load("./resurse/sprites/UI_Flat_Cross_Large.png")
    SAVE_FIELD = pygame.image.load("./resurse/sprites/UI_Flat_Textfield_01.png")
    SAVE_IMG = pygame.image.load("./resurse/sprites/UI_Flat_Checkmark_Large.png")
    SAVE_PATH = "./salvari"
    

    def __init__(self) -> None:
        """ Constructorul clasei UI """
        pygame.init()
        pygame.display.set_caption("Cucu Stefan Catalin - Tic-Tac-Toe")
        self.running, self.playing = True, False
        self.DISPLAY_W, self.DISPLAY_H = 1920, 1080
        self.display = pygame.Surface((self.DISPLAY_W, self.DISPLAY_H))
        self.window = pygame.display.set_mode(((self.DISPLAY_W, self.DISPLAY_H)))
        self.font_name = "./resurse/font/Monocraft.ttf"

    def get_font(self, size):
        """ Returneaza fontul interfetei, la dimensiunea dorita

        Args:
            size (int): dimensiunea fontului

        Returns:
            Font: fontul de dimensiune dorita
        
        """
        return pygame.font.Font(self.font_name, size)

    def main_menu(self):
        """ Afiseaza meniul principal """
        while True:
            self.window.fill(UI.COLOR_BACKGROUND)

            TITLE_TEXT = self.get_font(65).render("Tic-Tac-Toe", True, "black")
            NEW_GAME_BUTTON = Button(pygame.transform.rotozoom(UI.BUTTON_LARGE_LOCK, 0, 7.5), (960, 400), "New Game", self.get_font(55), "black")
            LOAD_GAME_BUTTON = Button(pygame.transform.rotozoom(UI.BUTTON_LARGE_LOCK, 0, 7.5), (960, 600), "Load Game", self.get_font(55), "black")
            EXIT_GAME_BUTTON = Button(pygame.transform.rotozoom(UI.BUTTON_LARGE_LOCK, 0, 7.5), (960, 800), "Exit", self.get_font(55), "black")

            self.window.blit(pygame.transform.rotozoom(UI.BANNER_TITLE, 0, 8), (576,0))
            self.window.blit(TITLE_TEXT, (730,80))
            NEW_GAME_BUTTON.update(self.window)
            LOAD_GAME_BUTTON.update(self.window)
            EXIT_GAME_BUTTON.update(self.window)
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    sys.exit()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if NEW_GAME_BUTTON.check(pygame.mouse.get_pos()):
                        self.new_game_options()
                    elif LOAD_GAME_BUTTON.check(pygame.mouse.get_pos()):
                        self.load_game_menu()
                    elif EXIT_GAME_BUTTON.check(pygame.mouse.get_pos()):
                        sys.exit()
            pygame.display.update()

    def new_game_options(self):
        """ Afiseaza meniul de incepere a unui joc nou """
        dif_toggle = 1
        algo_toggle = False
        mode_toggle = 2
        player_toggle = False
        grid_size = 5

        while True:
            self.window.fill(UI.COLOR_BACKGROUND)

            TITLE_TEXT = self.get_font(65).render("New Game", True, "black")
            self.window.blit(pygame.transform.rotozoom(UI.BANNER_TITLE, 0, 8), (576,0))
            self.window.blit(TITLE_TEXT, (960 - TITLE_TEXT.get_size()[0] / 2,80))

            ALGO_LABEL = self.get_font(55).render("Algorithm:", True, "black")
            MINMAX_LABEL = self.get_font(55).render("Minimax", True, "green" if not algo_toggle else "black")
            AB_LABEL = self.get_font(55).render("Alphabeta", True, "green" if algo_toggle else "black")
            ALGO_TOGGLE = Button(pygame.transform.rotozoom(UI.TOGGLE_ON if algo_toggle == True else UI.TOGGLE_OF, 0, 4), (1250, 290))

            self.window.blit(ALGO_LABEL, (300,250))
            self.window.blit(MINMAX_LABEL, (810,250))
            self.window.blit(AB_LABEL, (1450,250))
            ALGO_TOGGLE.update(self.window)

            DIF_LABEL = self.get_font(55).render("Difficulty:", True, "black")
            EASY_BUTTON = Button(pygame.transform.rotozoom(UI.BUTTON_SMALL_LOCK if dif_toggle != 1 else UI.BUTTON_SMALL_PRESS, 0, 4), (1060, 435), "1", self.get_font(55), "black")
            MEDIUM_BUTTON = Button(pygame.transform.rotozoom(UI.BUTTON_SMALL_LOCK if dif_toggle != 2 else UI.BUTTON_SMALL_PRESS, 0, 4), (1260, 435), "2", self.get_font(55), "black")            
            HARD_BUTTON = Button(pygame.transform.rotozoom(UI.BUTTON_SMALL_LOCK if dif_toggle != 3 else UI.BUTTON_SMALL_PRESS, 0, 4), (1460, 435), "3", self.get_font(55), "black")
            
            self.window.blit(DIF_LABEL, (300,400))
            EASY_BUTTON.update(self.window)
            MEDIUM_BUTTON.update(self.window)
            HARD_BUTTON.update(self.window)
            
            MODE_LABEL = self.get_font(55).render("Game mode:", True, "black")
            PVP_BUTTON = Button(pygame.transform.rotozoom(UI.BUTTON_SMALL_LOCK if mode_toggle != 1 else UI.BUTTON_SMALL_PRESS, 0, 4), (1060, 580), "PVP", self.get_font(50), "black")
            PVE_BUTTON = Button(pygame.transform.rotozoom(UI.BUTTON_SMALL_LOCK if mode_toggle != 2 else UI.BUTTON_SMALL_PRESS, 0, 4), (1260, 580), "PVE", self.get_font(50), "black")            
            CPU_BUTTON = Button(pygame.transform.rotozoom(UI.BUTTON_SMALL_LOCK if mode_toggle != 3 else UI.BUTTON_SMALL_PRESS, 0, 4), (1460, 580), "CPU", self.get_font(50), "black")

            self.window.blit(MODE_LABEL, (300,550))
            PVP_BUTTON.update(self.window)
            PVE_BUTTON.update(self.window)
            CPU_BUTTON.update(self.window)

            PLAYER_LABEL = self.get_font(55).render("Player 1:", True, "black")
            X_LABEL = self.get_font(55).render("X", True, "green" if not player_toggle else "black")
            O_LABEL = self.get_font(55).render("O", True, "green" if player_toggle else "black")
            PLAYER_TOGGLE = Button(pygame.transform.rotozoom(UI.TOGGLE_ON if player_toggle == True else UI.TOGGLE_OF, 0, 4), (1250, 725))

            self.window.blit(PLAYER_LABEL, (300,680))
            self.window.blit(X_LABEL, (1030,680))
            self.window.blit(O_LABEL, (1440,680))
            PLAYER_TOGGLE.update(self.window)

            N_LABEL = self.get_font(55).render("Grid size:", True, "black")
            MINUS_BUTTON = Button(None, (1060, 840), "-", self.get_font(55), "black")
            VALUE_LABEL = self.get_font(55).render(f"{grid_size}", True, "black")
            PLUS_BUTTON = Button(None, (1460, 840), "+", self.get_font(55), "black")

            self.window.blit(N_LABEL, (300,800))
            MINUS_BUTTON.update(self.window)
            self.window.blit(VALUE_LABEL, (1240,800))
            PLUS_BUTTON.update(self.window)

            START_GAME_BUTTON = Button(pygame.transform.rotozoom(UI.BUTTON_LARGE_LOCK, 0, 7.5), (960, 990), "START GAME!", self.get_font(55), "black")
            START_GAME_BUTTON.update(self.window)

            BACK_BUTTON = Button(None, (1890, 30), "<", self.get_font(65), "black")
            BACK_BUTTON.update(self.window)

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    sys.exit()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if EASY_BUTTON.check(pygame.mouse.get_pos()):
                        dif_toggle = 1
                    elif MEDIUM_BUTTON.check(pygame.mouse.get_pos()):
                        dif_toggle = 2 
                    elif HARD_BUTTON.check(pygame.mouse.get_pos()):
                        dif_toggle = 3 
                    
                    elif ALGO_TOGGLE.check(pygame.mouse.get_pos()):
                        algo_toggle = not algo_toggle

                    elif PVP_BUTTON.check(pygame.mouse.get_pos()):
                        mode_toggle = 1
                    elif PVE_BUTTON.check(pygame.mouse.get_pos()):
                        mode_toggle = 2
                    elif CPU_BUTTON.check(pygame.mouse.get_pos()):
                        mode_toggle = 3
                    
                    elif PLAYER_TOGGLE.check(pygame.mouse.get_pos()):
                        player_toggle = not player_toggle
                    
                    elif MINUS_BUTTON.check(pygame.mouse.get_pos()):
                        if grid_size > 5:
                            grid_size -= 1
                    elif PLUS_BUTTON.check(pygame.mouse.get_pos()):
                        if grid_size < 10:
                            grid_size += 1

                    elif START_GAME_BUTTON.check(pygame.mouse.get_pos()):
                        self.game_screen(dif_toggle, algo_toggle, mode_toggle, player_toggle, grid_size)
                    
                    elif BACK_BUTTON.check(pygame.mouse.get_pos()):
                        self.main_menu()
            pygame.display.update()

    
    def load_game_menu(self):
        """ Afiseaza meniul de incarcare din fisier a unui joc """
        files = []
        start = 0
        while True:
            try:
                files = [f for f in os.listdir(UI.SAVE_PATH) if os.path.isfile(os.path.join(UI.SAVE_PATH, f))]
            except:
                try:
                    os.mkdir("./salvari")
                except Exception as e:
                    print(f"NU ARE DREPTURI DE CREAT DIRECTOR {e}")
                    sys.exit(1)
            self.window.fill(UI.COLOR_BACKGROUND)

            TITLE_TEXT = self.get_font(65).render("Load Game", True, "black")
            self.window.blit(pygame.transform.rotozoom(UI.BANNER_TITLE, 0, 8), (576,0))
            self.window.blit(TITLE_TEXT, (960 - TITLE_TEXT.get_size()[0] / 2,80))

            self.window.blit(pygame.transform.rotozoom(UI.SAVE_FIELD, 0, 5), (480, 300))
            self.window.blit(pygame.transform.rotozoom(UI.SAVE_FIELD, 0, 5), (480, 478))
            self.window.blit(pygame.transform.rotozoom(UI.SAVE_FIELD, 0, 5), (480, 656))
            self.window.blit(pygame.transform.rotozoom(UI.SAVE_FIELD, 0, 5), (480, 834))

            BACK_BUTTON = Button(None, (1890, 30), "<", self.get_font(65), "black")
            BACK_BUTTON.update(self.window)

            del_btns = []
            play_btns = []
            cnt = 0
            for file_index in range(start, min(len(files), start + 4)):
                FILE_LABEL = self.get_font(65).render(files[file_index][:10] + ('...' if len(files[file_index]) > 10 else ''), True, "black")
                DELETE_BUTTON =  Button(pygame.transform.rotozoom(UI.CLOSE_IMG, 0, 3), (1390, 375 + file_index % 4 * 178))
                PLAY_BUTTON =  Button(pygame.transform.rotozoom(UI.SAVE_IMG, 0, 3), (1300, 375 + file_index  % 4 * 178))

                self.window.blit(FILE_LABEL, (490, 320 + file_index % 4 * 178))
                DELETE_BUTTON.update(self.window)
                PLAY_BUTTON.update(self.window)

                del_btns.append(DELETE_BUTTON)
                play_btns.append(PLAY_BUTTON)
                cnt += 1

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    sys.exit()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if BACK_BUTTON.check(event.pos):
                        self.main_menu()
                    for i in range(cnt):
                        if del_btns[i].check(event.pos):
                            try:
                                os.remove(os.path.join(UI.SAVE_PATH, files[i + start]))
                            except Exception as e:
                                print(f"CANNOT DELETE FILE {os.path.join(UI.SAVE_PATH, files[i + start])}: {e}")
                        elif play_btns[i].check(event.pos):
                            loaded_state, difficulty, algo, mode, time_elapsed, nodes_stats, nr_turns_X, nr_turns_O, time_stats = load_game_file(files[i + start])
                            self.game_screen(difficulty, algo, mode, Game.PLAYER_MAX != 'X', Game.N, time_elapsed, nodes_stats, time_stats, nr_turns_X, nr_turns_O, loaded_state)
                if event.type == pygame.MOUSEWHEEL:
                    if event.y > 0 and start + 4 < len(files):
                        start += 4
                    elif event.y < 0 and start - 4 >= 0:
                        start -= 4
                

            pygame.display.update()


    def game_screen(self, difficulty=3, algo=False, mode=1, player=True, grid_size=5, time_elapsed = 0, nodes_stats = [], time_stats = [], nr_turns_X = 0, nr_turns_O = 0, loaded_state = None):
        """ Afiseaza meniul de joc 
        
        Args:
            difficulty (int): dificultatea jocului
            algo (bool): algoritmul folosit de joc
                         False = min_max, True = alpha_beta
            mode (int): modul de joc (PVP/PVE/CPU)
            player (bool): cu ce caracter joaca primul jucator
            grid_size (int): dimensiunea tablei de joc
            time_elapsed (float): cat timp a trecut deja din joc
            nodes_stats (list[int]): nr de noduri generate in fiecare tura trecuta
            nr_turns_X (int): cate ture a avut X
            nr_turns_O (int): cate ture a avut O
            loaded_state (GameState): starea de inceput, incarcata din fisier

        """

        ### Setup initial

        time_start_game = time.time() - time_elapsed
        has_finished = False

        def print_info(time_start):
            print(current_state)
            print(f"Move time: {time.time() - time_start}s")
            print('~' * 50)
            time_stats.append(time.time()-time_start)
            nodes_stats.append(current_state.nodes)
            
        if difficulty == 1:
            depth = 1
        elif difficulty == 2:
            depth = 2
        else:
            depth = 3 if not algo and grid_size < 7 else 5
        if not player:
            Game.PLAYER_MAX = 'O'
            Game.PLAYER_MIN = 'X'
        else:
            Game.PLAYER_MAX = 'X'
            Game.PLAYER_MIN = 'O'
        
        Game.N = grid_size

        current_state = loaded_state if loaded_state else GameState(Game(), 'X', depth)
        print("INITIAL STATE")
        print_info(time_start_game)

        draggable = None
        time_move = None
        while True:

            ### Desenarea interfetei 

            self.window.fill(UI.COLOR_BACKGROUND)
            if Game.N == 5 or Game.N == 10:   # Pentru usurime, dimensiunea gridului in pixeli variaza in functie de numarul de celule
                grid_dim = 950
            elif Game.N == 6:
                grid_dim = 948
            elif Game.N == 7 or Game.N == 8:
                grid_dim = 952
            else:
                grid_dim = 954
            start_x = (self.DISPLAY_W - grid_dim) / 2
            start_y = (self.DISPLAY_H - grid_dim) / 2
            pygame.draw.rect(self.window, "white", pygame.Rect(start_x, start_y, grid_dim, grid_dim), grid_dim)
            pygame.draw.rect(self.window, "black", pygame.Rect(start_x, start_y, grid_dim, grid_dim), 2)
            
            X_LABEL = self.get_font(55).render("X", True, "black" if current_state.player != 'X' else "green")
            O_LABEL = self.get_font(55).render("O", True, "black" if current_state.player != 'O' else "green")
            CLOSE_BUTTON = Button(pygame.transform.rotozoom(UI.CLOSE_IMG, 0, 3), (1890, 30))

            self.window.blit(X_LABEL, (300,80))
            self.window.blit(O_LABEL, (1620,80))
            CLOSE_BUTTON.update(self.window)

            cell_size = grid_dim / Game.N
            x = float(0)
            j = 0
            grid = []
            while x < grid_dim: # Desenarea propriu-zisa a grid-ului
                y = float(0)
                i = 0
                grid.append([])
                while y < grid_dim:
                    rect = pygame.Rect(start_x+x, start_y+y, cell_size, cell_size)
                    if mode == 1 or (mode == 2 and current_state.player == Game.PLAYER_MIN):
                        if current_state.game.state_matrix[i][j] == Game.BLANK and current_state.game.banned_pos != (i,j):
                            overlay = pygame.Surface((int(cell_size), int(cell_size))) # Desenam pozitiile posibile ale jucatorului
                            overlay.set_alpha(64)
                            color = "green"
                            for pos in [(-1, -1), (-1, 1), (1, -1), (1, 1)]:
                                try:
                                    if current_state.game.state_matrix[i + pos[0]][j + pos[1]] == Game.get_opposite_player(current_state.player) and current_state.game.state_matrix[i + 2 * pos[0]][j + 2 * pos[1]] == current_state.player:
                                        color = "yellow" # Daca pozitia se poate face si prin captura, va fi galbena
                                        break
                                except:
                                    pass
                            overlay.fill(color)
                            self.window.blit(overlay, (start_x + x, start_y + y))
                    pygame.draw.rect(self.window, "black", rect, 1)
                    grid[j].append(rect)
                    if current_state.game.state_matrix[i][j] == Game.BLANK:
                        y += cell_size
                        i += 1
                        continue 
                    color = "black"
                    if current_state.game.check_if_final() != False and current_state.game.check_if_final() != 'remiza':
                        win_pos = current_state.game.winner_config
                        if check_if_in_square(win_pos, (i, j)): # Desenam configuratia castigatoare
                            color = "green"
                    symbol = self.get_font(85).render(current_state.game.state_matrix[i][j], True, color)
                    rect = symbol.get_rect(center=(start_x+x+cell_size/2, start_y+y+cell_size/2))
                    self.window.blit(symbol, rect)
                    y += cell_size
                    i += 1
                x += cell_size
                j += 1

            if current_state.game.check_if_final() != False: # Overlay pentru finalul meciului
                overlay = pygame.Surface((self.DISPLAY_W, self.DISPLAY_H))
                overlay.set_alpha(128)
                overlay.fill("black")
                self.window.blit(overlay, (0,0))

                winner = current_state.game.check_if_final()
                winner = f'{winner} wins!' if winner != 'remiza' else 'Tie!'

                if not has_finished:
                    print('~' * 10 + 'MECIUL S-A TERMINAT' + '~' * 10)
                    print(winner)
                    print(f"""
Timp total: {time.time() - time_start_game}s
Min timp gandire: {min(time_stats)}s
Max timp gandire: {max(time_stats)}s
Avg timp gandire: {sum(time_stats)/len(time_stats)}s
Mediana timp gandire: {statistics.median(time_stats)}
Ture X: {nr_turns_X}
Ture O: {nr_turns_O}
Nr total noduri: {sum(nodes_stats)}
Min noduri generate: {min(nodes_stats)}
Max noduri generate: {max(nodes_stats)}
Avg noduri generate: {sum(nodes_stats) / len(nodes_stats)}
Mediana nodurilor generate: {statistics.median(nodes_stats)}
                    """)
                    has_finished = True

                WIN_TEXT =  self.get_font(65).render(winner, True, "white")
                self.window.blit(WIN_TEXT, (820, 500) if winner != 'Tie!' else (880, 500))

                MENU_BUTTON = Button(pygame.transform.rotozoom(UI.BUTTON_LARGE_LOCK, 0, 7.5), (960, 800), "Back to menu", self.get_font(55), "black")
                MENU_BUTTON.update(self.window)

                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        sys.exit()
                    if event.type == pygame.MOUSEBUTTONDOWN:
                        if MENU_BUTTON.check(event.pos):
                            self.main_menu()

                pygame.display.update()
                continue
            
            pygame.display.update()
            
            ### Calculul mutarilor

            if mode == 1 or (mode == 2 and current_state.player == Game.PLAYER_MIN): 
                
                ### Mutarea utilizatorului

                if not time_move:
                    time_move = time.time() # timpul cand a inceput mutarea
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        print('~' * 10 + 'MECIUL S-A TERMINAT DEVREME' + '~' * 10)
                        print(f"""
Total time: {time.time() - time_start_game}s
Min timp gandire: {min(time_stats)}s
Max timp gandire: {max(time_stats)}s
Avg timp gandire: {sum(time_stats)/len(time_stats)}s
Mediana timp gandire: {statistics.median(time_stats)}
Turns X: {nr_turns_X}
Turns O: {nr_turns_O}
Total nodes: {sum(nodes_stats)}
Min nodes generated: {min(nodes_stats)}
Max nodes generated: {max(nodes_stats)}
Avg nodes generated: {sum(nodes_stats) / len(nodes_stats)}
Median nodes generated: {statistics.median(nodes_stats)}
                            """)
                        sys.exit()
                    if event.type == pygame.KEYDOWN: # RESET + SAVE 
                        keys = pygame.key.get_pressed()
                        if keys[pygame.K_r]:
                            time_start_game = time.time()
                            nodes_stats = []
                            nr_turns_X = 0
                            nr_turns_O = 0
                            current_state = GameState(Game(), 'X', depth)
                            print("GAME RESTARTED")
                            print_info(time_start_game)
                        elif keys[pygame.K_s]:
                            save_game_file(current_state, difficulty, algo, mode, time.time() - time_start_game, nodes_stats, nr_turns_X, nr_turns_O, time_stats)

                    if event.type == pygame.MOUSEBUTTONDOWN:
                        pos = event.pos
                        if CLOSE_BUTTON.check(pos): # S-A APASAT PE X
                            print('~' * 10 + 'MECIUL S-A TERMINAT DEVREME' + '~' * 10)
                            print(f"""
Total time: {time.time() - time_start_game}s
Min timp gandire: {min(time_stats)}s
Max timp gandire: {max(time_stats)}s
Avg timp gandire: {sum(time_stats)/len(time_stats)}s
Mediana timp gandire: {statistics.median(time_stats)}
Turns X: {nr_turns_X}
Turns O: {nr_turns_O}
Total nodes: {sum(nodes_stats)}
Min nodes generated: {min(nodes_stats)}
Max nodes generated: {max(nodes_stats)}
Avg nodes generated: {sum(nodes_stats) / len(nodes_stats)}
Median nodes generated: {statistics.median(nodes_stats)}
                            """)
                            self.main_menu()
                        if not start_x < pos[0] < start_x + grid_dim or \
                            not start_y < pos[1] < start_y + grid_dim:
                            continue # Verificam daca click-ul este in grid
                        cell_i = (pos[1] - start_y) / cell_size
                        cell_j = (pos[0] - start_x) / cell_size
                        if current_state.game.state_matrix[int(cell_i)][int(cell_j)] == current_state.player:
                            draggable = grid[int(cell_i)][int(cell_j)] 
                            continue
                        elif current_state.game.state_matrix[int(cell_i)][int(cell_j)] != Game.BLANK:
                            continue
                        elif current_state.game.banned_pos == (int(cell_i), int(cell_j)):
                            continue
                        print('PLAYER MOVE')
                        current_state.game.state_matrix[int(cell_i)][int(cell_j)] = current_state.player
                        current_state.player = Game.get_opposite_player(current_state.player)
                        if current_state.player == 'X':
                            nr_turns_X += 1
                        else:
                            nr_turns_O += 1
                        draggable = None
                        print_info(time_move)
                        time_move = None
                    if event.type == pygame.MOUSEBUTTONUP:
                        if not draggable:
                            continue
                        # Mutarea de tip captura
                        pos = event.pos
                        if not start_x < pos[0] < start_x + grid_dim or \
                            not start_y < pos[1] < start_y + grid_dim:
                            continue
                        cell_i = (pos[1] - start_y) // cell_size
                        cell_j = (pos[0] - start_x) // cell_size
                        if current_state.game.state_matrix[int(cell_i)][int(cell_j)] != Game.BLANK:
                            continue
                        old_cell_j = (draggable.y - start_y) // cell_size
                        old_cell_i = (draggable.x - start_x) // cell_size
                        diag = get_diagonal_block(cell_i, cell_j, old_cell_i, old_cell_j)
                        if not diag:
                            continue
                        if current_state.game.state_matrix[int(diag[0])][int(diag[1])] != Game.get_opposite_player(current_state.player):
                            continue
                        current_state.game.state_matrix[int(cell_i)][int(cell_j)] = current_state.player
                        current_state.game.state_matrix[int(diag[0])][int(diag[1])] = Game.BLANK
                        current_state.game.state_matrix[int(old_cell_i)][int(old_cell_j)] = Game.BLANK
                        current_state.game.banned_pos = (int(diag[0]), int(diag[1]))
                        current_state.player = Game.get_opposite_player(current_state.player)
                        if current_state.player == 'X':
                            nr_turns_X += 1
                        else:
                            nr_turns_O += 1
                        print('PLAYER MOVE')
                        print_info(time_move)
                        time_move = None
                        draggable = None    
            else:
                # Mutarea calculatorului
                print('CPU MOVE')
                time_move = time.time()
                score_mode = 'score_1' if current_state.player == Game.PLAYER_MAX else 'score_2'
                if algo:
                    current_state.game = alpha_beta(-int(1e+5), int(1e+5), current_state, score_mode).best_move.game
                else:
                    current_state.game = min_max(current_state, score_mode).best_move.game
                current_state.player = Game.get_opposite_player(current_state.player)
                if current_state.player == 'X':
                    nr_turns_X += 1
                else:
                    nr_turns_O += 1
                print_info(time_move)
                time_move = None
            


if __name__ == '__main__':
    ui = UI()
    ui.main_menu()
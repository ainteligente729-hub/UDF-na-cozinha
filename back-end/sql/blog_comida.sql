-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 09/11/2026 às 03:29
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `blog_comida`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `afiliados`
--

CREATE TABLE `afiliados` (
  `id_afiliado` int(11) NOT NULL,
  `id_receita` int(11) DEFAULT NULL,
  `id_ingredientes` int(11) DEFAULT NULL,
  `titulo` varchar(120) NOT NULL,
  `loja` varchar(60) DEFAULT NULL,
  `url` varchar(1000) NOT NULL,
  `imagem_url` varchar(500) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `cliques` int(11) NOT NULL DEFAULT 0,
  `dt_cadastro` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `avaliacoes`
--

CREATE TABLE `avaliacoes` (
  `id_receita` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nota` tinyint(4) NOT NULL,
  `dt_avaliacao` datetime NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nome` varchar(80) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `comentarios`
--

CREATE TABLE `comentarios` (
  `id_comentario` int(11) NOT NULL,
  `id_receita` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `texto` text NOT NULL,
  `dt_comentario` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `favoritos`
--

CREATE TABLE `favoritos` (
  `id_receita` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `dt_fav` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `ingredientes`
--

CREATE TABLE `ingredientes` (
  `id_ingredientes` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `modo_preparo`
--

CREATE TABLE `modo_preparo` (
  `id_passo` int(11) NOT NULL,
  `id_receita` int(11) NOT NULL,
  `ordem` int(11) NOT NULL,
  `desc_passo` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `receitas`
--

CREATE TABLE `receitas` (
  `id_receita` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `slug` varchar(80) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `tp_prep` int(11) DEFAULT NULL,
  `tp_cozi` int(11) DEFAULT NULL,
  `rendimento` int(11) DEFAULT NULL,
  `calorias` int(11) DEFAULT NULL,
  `dificuldade` enum('facil','medio','dificil') NOT NULL,
  `dt_publicacao` datetime NOT NULL DEFAULT current_timestamp(),
  `imagem_capa` varchar(500) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `dt_atualizacao` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `receita_imagens`
--

CREATE TABLE `receita_imagens` (
  `id_imagem` int(11) NOT NULL,
  `id_receita` int(11) NOT NULL,
  `url_grande` varchar(500) NOT NULL,
  `url_media` varchar(500) NOT NULL,
  `url_thumb` varchar(500) NOT NULL,
  `storage_key` varchar(200) NOT NULL,
  `alt_text` varchar(200) DEFAULT NULL,
  `largura` int(11) DEFAULT NULL,
  `altura` int(11) DEFAULT NULL,
  `principal` tinyint(1) NOT NULL DEFAULT 0,
  `dt_upload` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `receita_ingredientes`
--

CREATE TABLE `receita_ingredientes` (
  `id_receita` int(11) NOT NULL,
  `id_ingredientes` int(11) NOT NULL,
  `quantidade` decimal(8,2) NOT NULL,
  `un_medida` varchar(30) NOT NULL,
  `ordem` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `receita_tags`
--

CREATE TABLE `receita_tags` (
  `id_tags` int(11) NOT NULL,
  `id_receita` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tags`
--

CREATE TABLE `tags` (
  `id_tags` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `perfil` enum('admin','autor','leitor') NOT NULL DEFAULT 'leitor',
  `dt_cadastro` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `afiliados`
--
ALTER TABLE `afiliados`
  ADD PRIMARY KEY (`id_afiliado`),
  ADD KEY `FK_AFIL_receita` (`id_receita`),
  ADD KEY `FK_AFIL_ingrediente` (`id_ingredientes`);

--
-- Índices de tabela `avaliacoes`
--
ALTER TABLE `avaliacoes`
  ADD PRIMARY KEY (`id_receita`,`id_usuario`),
  ADD KEY `FK_AVAL_usuario` (`id_usuario`),
  ADD KEY `IDX_avaliacoes_receita` (`id_receita`);

--
-- Índices de tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `nome` (`nome`);

--
-- Índices de tabela `comentarios`
--
ALTER TABLE `comentarios`
  ADD PRIMARY KEY (`id_comentario`),
  ADD KEY `FK_COM_usuario` (`id_usuario`),
  ADD KEY `FK_COM_receita` (`id_receita`);

--
-- Índices de tabela `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id_receita`,`id_usuario`),
  ADD KEY `FK_FAV_usuario` (`id_usuario`);

--
-- Índices de tabela `ingredientes`
--
ALTER TABLE `ingredientes`
  ADD PRIMARY KEY (`id_ingredientes`),
  ADD UNIQUE KEY `nome` (`nome`),
  ADD UNIQUE KEY `UQ_ingrediente_nome` (`nome`);

--
-- Índices de tabela `modo_preparo`
--
ALTER TABLE `modo_preparo`
  ADD PRIMARY KEY (`id_passo`),
  ADD UNIQUE KEY `id_receita` (`id_receita`,`ordem`);

--
-- Índices de tabela `receitas`
--
ALTER TABLE `receitas`
  ADD PRIMARY KEY (`id_receita`),
  ADD UNIQUE KEY `UQ_receita_slug` (`slug`),
  ADD KEY `FK_receitas_usuario` (`id_usuario`),
  ADD KEY `IDX_receitas_categoria` (`id_categoria`),
  ADD KEY `IDX_receitas_publicacao` (`dt_publicacao`);

--
-- Índices de tabela `receita_imagens`
--
ALTER TABLE `receita_imagens`
  ADD PRIMARY KEY (`id_imagem`),
  ADD KEY `FK_IMG_receita` (`id_receita`);

--
-- Índices de tabela `receita_ingredientes`
--
ALTER TABLE `receita_ingredientes`
  ADD PRIMARY KEY (`id_receita`,`id_ingredientes`),
  ADD KEY `FK_RI_ingrediente` (`id_ingredientes`);

--
-- Índices de tabela `receita_tags`
--
ALTER TABLE `receita_tags`
  ADD PRIMARY KEY (`id_tags`,`id_receita`),
  ADD KEY `FK_RT_receita` (`id_receita`);

--
-- Índices de tabela `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id_tags`),
  ADD UNIQUE KEY `nome` (`nome`),
  ADD UNIQUE KEY `UQ_tag_nome` (`nome`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `afiliados`
--
ALTER TABLE `afiliados`
  MODIFY `id_afiliado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `comentarios`
--
ALTER TABLE `comentarios`
  MODIFY `id_comentario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `ingredientes`
--
ALTER TABLE `ingredientes`
  MODIFY `id_ingredientes` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `modo_preparo`
--
ALTER TABLE `modo_preparo`
  MODIFY `id_passo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `receitas`
--
ALTER TABLE `receitas`
  MODIFY `id_receita` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `receita_imagens`
--
ALTER TABLE `receita_imagens`
  MODIFY `id_imagem` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tags`
--
ALTER TABLE `tags`
  MODIFY `id_tags` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `afiliados`
--
ALTER TABLE `afiliados`
  ADD CONSTRAINT `FK_AFIL_ingrediente` FOREIGN KEY (`id_ingredientes`) REFERENCES `ingredientes` (`id_ingredientes`) ON DELETE SET NULL,
  ADD CONSTRAINT `FK_AFIL_receita` FOREIGN KEY (`id_receita`) REFERENCES `receitas` (`id_receita`) ON DELETE CASCADE;

--
-- Restrições para tabelas `avaliacoes`
--
ALTER TABLE `avaliacoes`
  ADD CONSTRAINT `FK_AVAL_receita` FOREIGN KEY (`id_receita`) REFERENCES `receitas` (`id_receita`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_AVAL_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Restrições para tabelas `comentarios`
--
ALTER TABLE `comentarios`
  ADD CONSTRAINT `FK_COM_receita` FOREIGN KEY (`id_receita`) REFERENCES `receitas` (`id_receita`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_COM_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Restrições para tabelas `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `FK_FAV_receita` FOREIGN KEY (`id_receita`) REFERENCES `receitas` (`id_receita`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_FAV_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Restrições para tabelas `modo_preparo`
--
ALTER TABLE `modo_preparo`
  ADD CONSTRAINT `FK_preparo_receita` FOREIGN KEY (`id_receita`) REFERENCES `receitas` (`id_receita`) ON DELETE CASCADE;

--
-- Restrições para tabelas `receitas`
--
ALTER TABLE `receitas`
  ADD CONSTRAINT `FK_receitas_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`),
  ADD CONSTRAINT `FK_receitas_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Restrições para tabelas `receita_imagens`
--
ALTER TABLE `receita_imagens`
  ADD CONSTRAINT `FK_IMG_receita` FOREIGN KEY (`id_receita`) REFERENCES `receitas` (`id_receita`) ON DELETE CASCADE;

--
-- Restrições para tabelas `receita_ingredientes`
--
ALTER TABLE `receita_ingredientes`
  ADD CONSTRAINT `FK_RI_ingrediente` FOREIGN KEY (`id_ingredientes`) REFERENCES `ingredientes` (`id_ingredientes`),
  ADD CONSTRAINT `FK_RI_receita` FOREIGN KEY (`id_receita`) REFERENCES `receitas` (`id_receita`) ON DELETE CASCADE;

--
-- Restrições para tabelas `receita_tags`
--
ALTER TABLE `receita_tags`
  ADD CONSTRAINT `FK_RT_receita` FOREIGN KEY (`id_receita`) REFERENCES `receitas` (`id_receita`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_RT_tags` FOREIGN KEY (`id_tags`) REFERENCES `tags` (`id_tags`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
